import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Timetable } from "./components/Timetable";
import { StudyTimer } from "./components/StudyTimer";
import { Stats } from "./components/Stats";
import { Settings } from "./components/Settings";
import { Group } from "./components/Group";
import { Login } from "./components/Login";

// Translation dictionaries
const translations = {
  ko: {
    level: "레벨",
    timetable: "시간표",
    timeline: "일정표",
    calendar: "캘린더",
    timer: "타이머",
    group: "그룹",
    stats: "통계",
    settings: "설정",
    logout: "로그아웃",
    lock: "자물쇠 ON",
    unlock: "자물쇠 OFF",
    aiAssistant: "AI 어시스턴트",
    aiPlaceholder: "예: 내일 오후 3시 수학 2시간",
    alertSaved: "학습 기록이 저장되었습니다!",
    levelup: "축하합니다! 레벨업 하셨습니다!"
  },
  en: {
    level: "Lv",
    timetable: "Timetable",
    timeline: "Timeline",
    calendar: "Calendar",
    timer: "Timer",
    group: "Group",
    stats: "Stats",
    settings: "Settings",
    logout: "Logout",
    lock: "Lock ON",
    unlock: "Lock OFF",
    aiAssistant: "AI Assistant",
    aiPlaceholder: "e.g., Math tomorrow at 3pm for 2h",
    alertSaved: "Study session saved!",
    levelup: "Congratulations! Level Up!"
  },
  jp: {
    level: "レベル",
    timetable: "時間割",
    timeline: "タイムライン",
    calendar: "カレンダー",
    timer: "タイマー",
    group: "グループ",
    stats: "統計",
    settings: "設定",
    logout: "ログアウト",
    lock: "ロックON",
    unlock: "ロックOFF",
    aiAssistant: "AI アシスタント",
    aiPlaceholder: "例：明日午後3時数学2時間",
    alertSaved: "勉強記録が保存されました！",
    levelup: "おめでとうございます！レベルアップ！"
  },
  cn: {
    level: "等级",
    timetable: "课程表",
    timeline: "日程表",
    calendar: "日历",
    timer: "定时器",
    group: "群组",
    stats: "统计",
    settings: "设置",
    logout: "登出",
    lock: "锁定开启",
    unlock: "锁定关闭",
    aiAssistant: "AI 助手",
    aiPlaceholder: "例如：明天下午3点数学2小时",
    alertSaved: "学习记录已保存！",
    levelup: "恭喜！等级提升！"
  },
  vi: {
    level: "Cấp",
    timetable: "T.Khóa Biểu",
    timeline: "Lịch trình",
    calendar: "Lịch",
    timer: "Hẹn giờ",
    group: "Nhóm",
    stats: "Thống kê",
    settings: "Cài đặt",
    logout: "Đăng xuất",
    lock: "Khóa Bật",
    unlock: "Khóa Tắt",
    aiAssistant: "Trợ lý AI",
    aiPlaceholder: "Ví dụ: Học Toán 2 tiếng ngày mai lúc 3h chiều",
    alertSaved: "Đã lưu kết quả học tập!",
    levelup: "Chúc mừng! Bạn đã tăng cấp!"
  }
};

const subjectsList = ["국어", "영어", "수학", "과학", "사회", "역사", "물리", "화학", "생물", "정보", "체육", "기타"];

const initialSchedule = [
  { id: 1, day: "mon", startHour: 9, duration: 2, subject: "수학", location: "교실 3A" },
  { id: 2, day: "mon", startHour: 11, duration: 1, subject: "영어", location: "어학실" },
  { id: 3, day: "tue", startHour: 10, duration: 2, subject: "국어", location: "교실 3A" },
  { id: 4, day: "wed", startHour: 9, duration: 2, subject: "과학", location: "과학실" },
  { id: 5, day: "thu", startHour: 13, duration: 2, subject: "영어", location: "어학실" },
  { id: 6, day: "fri", startHour: 14, duration: 2, subject: "수학", location: "교실 3B" }
];

function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("timetable"); // timetable | timer | group | stats | settings
  
  // Lazy state initializations to prevent synchronous setState in useEffect
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem("sf_lang") || "ko");
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem("sf_level")) || 1);
  const [exp, setExp] = useState(() => parseInt(localStorage.getItem("sf_exp")) || 0);

  const [schedule, setSchedule] = useState(() => {
    const local = localStorage.getItem("sf_schedule");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return initialSchedule;
  });

  const [stats, setStats] = useState(() => {
    const local = localStorage.getItem("sf_stats");
    const defaultStats = {
      totalStudyMinutes: 0,
      longestSessionMinutes: 0,
      joinedGroup: false,
      createdGroup: false,
      completedGroupGoals: 0
    };
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed) return { ...defaultStats, ...parsed };
      } catch (e) { console.error(e); }
    }
    return defaultStats;
  });

  const [restMinutesByType, setRestMinutesByType] = useState(() => {
    const local = localStorage.getItem("sf_rest");
    const defaultRest = {
      "식사": 0,
      "휴식": 0,
      "수면": 0,
      "기타": 0
    };
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed) return { ...defaultRest, ...parsed };
      } catch (e) { console.error(e); }
    }
    return defaultRest;
  });

  const [studyMinutesBySubject, setStudyMinutesBySubject] = useState(() => {
    const local = localStorage.getItem("sf_subject_study");
    const defaultStudy = {
      "수학": 0,
      "영어": 0,
      "국어": 0,
      "과학": 0,
      "사회": 0,
      "역사": 0,
      "기타": 0
    };
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed) return { ...defaultStudy, ...parsed };
      } catch (e) { console.error(e); }
    }
    return defaultStudy;
  });

  const [settings, setSettings] = useState(() => {
    const local = localStorage.getItem("sf_settings");
    const defaultSettings = {
      darkMode: false,
      allowSpecificApps: false,
      flipToFocus: false,
      notificationType: "sound"
    };
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed) return { ...defaultSettings, ...parsed };
      } catch (e) { console.error(e); }
    }
    return defaultSettings;
  });

  const [activeSubject, setActiveSubject] = useState("자율학습");
  const [timerMode, setTimerMode] = useState("pomodoro"); // pomodoro | timer | stopwatch
  const [showAiFabInput, setShowAiFabInput] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [aiFabText, setAiFabText] = useState("");

  // Safe fallback translation object
  const t = translations[currentLanguage] || translations["ko"];

  // Apply Dark Mode Class
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.darkMode ? "dark" : "light");
  }, [settings.darkMode]);

  // Sync state to Firestore when logged in, or local storage otherwise
  useEffect(() => {
    if (!user || user.isGuest) {
      localStorage.setItem("sf_lang", currentLanguage);
      localStorage.setItem("sf_level", level.toString());
      localStorage.setItem("sf_exp", exp.toString());
      localStorage.setItem("sf_schedule", JSON.stringify(schedule));
      localStorage.setItem("sf_stats", JSON.stringify(stats));
      localStorage.setItem("sf_rest", JSON.stringify(restMinutesByType));
      localStorage.setItem("sf_subject_study", JSON.stringify(studyMinutesBySubject));
      localStorage.setItem("sf_settings", JSON.stringify(settings));
      return;
    }

    // Debounce Firestore updates
    const syncWithFirestore = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          currentLanguage,
          level,
          exp,
          schedule,
          stats,
          restMinutesByType,
          studyMinutesBySubject,
          settings
        }, { merge: true });
      } catch (err) {
        console.error("Firestore sync error:", err);
      }
    };

    const timeout = setTimeout(syncWithFirestore, 1000);
    return () => clearTimeout(timeout);
  }, [user, currentLanguage, level, exp, schedule, stats, restMinutesByType, studyMinutesBySubject, settings]);

  // Load Firestore data on login
  useEffect(() => {
    if (!user || user.isGuest) return;
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.currentLanguage) setCurrentLanguage(data.currentLanguage);
          if (data.level) setLevel(data.level);
          if (data.exp) setExp(data.exp);
          if (data.schedule) setSchedule(data.schedule);
          if (data.stats) setStats(data.stats);
          if (data.restMinutesByType) setRestMinutesByType(data.restMinutesByType);
          if (data.studyMinutesBySubject) setStudyMinutesBySubject(data.studyMinutesBySubject);
          if (data.settings) setSettings(data.settings);
        }
      } catch (err) {
        console.error("Firestore fetch error:", err);
      }
    };
    fetchUserData();
  }, [user]);

  // Handle Save Study Session
  const handleSaveStudySession = (subject, minutes, logType) => {
    // 1. Update minutes
    if (logType === "공부" || logType === "rest") {
      setStudyMinutesBySubject(prev => ({
        ...prev,
        [subject]: (prev[subject] || 0) + minutes
      }));

      setStats(prev => ({
        ...prev,
        totalStudyMinutes: prev.totalStudyMinutes + minutes,
        longestSessionMinutes: Math.max(prev.longestSessionMinutes, minutes)
      }));

      // 2. Experience progression (5 min study = 50EXP)
      const earnedExp = Math.floor(minutes / 5) * 50;
      
      // If group goal is completed, double exp (5 min = 100exp)
      const isGroupCompleted = stats.totalStudyMinutes >= 120 && stats.joinedGroup; // simulated joint goal limit
      const finalExp = isGroupCompleted ? earnedExp * 2 : earnedExp;

      if (finalExp > 0) {
        addExperience(finalExp);
      }
    } else {
      // It's a rest type (식사, 휴식, 수면, 기타)
      setRestMinutesByType(prev => ({
        ...prev,
        [logType]: (prev[logType] || 0) + minutes
      }));
    }

    alert(`${subject} ${minutes}분 기록 완료! (${logType})`);
  };

  const addExperience = (amount) => {
    setExp(prev => {
      let newExp = prev + amount;
      let newLevel = level;
      const EXP_PER_LEVEL = 1000;

      while (newExp >= EXP_PER_LEVEL) {
        newExp -= EXP_PER_LEVEL;
        newLevel += 1;
      }

      if (newLevel !== level) {
        setLevel(newLevel);
        setTimeout(() => alert(t.levelup), 300);
      }

      return newExp;
    });
  };

  const handleStartTimerWithSubject = (subject, mode = "pomodoro") => {
    setActiveSubject(subject);
    setTimerMode(mode);
    setActiveTab("timer");
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // AI FAB floating scheduler parser
  const handleAiFabSubmit = () => {
    if (!aiFabText.trim()) return;

    let parsedSubject = "기타";
    let parsedDay = "mon";
    let parsedHour = 9;
    let parsedDuration = 1;
    let parsedLocation = "";

    // Parse subject
    const matchedSub = subjectsList.find(sub => aiFabText.includes(sub));
    if (matchedSub) parsedSubject = matchedSub;

    // Parse day
    if (aiFabText.includes("화요일") || aiFabText.includes("화")) parsedDay = "tue";
    else if (aiFabText.includes("수요일") || aiFabText.includes("수")) parsedDay = "wed";
    else if (aiFabText.includes("목요일") || aiFabText.includes("목")) parsedDay = "thu";
    else if (aiFabText.includes("금요일") || aiFabText.includes("금")) parsedDay = "fri";
    else if (aiFabText.includes("월요일") || aiFabText.includes("월")) parsedDay = "mon";

    // Parse time
    const timeMatch = aiFabText.match(/(\d+)시/);
    if (timeMatch) {
      let hr = parseInt(timeMatch[1]);
      if (aiFabText.includes("오후") && hr < 12) hr += 12;
      if (aiFabText.includes("저녁") && hr < 12) hr += 12;
      if (hr >= 9 && hr <= 16) parsedHour = hr;
    }

    // Parse duration
    const durMatch = aiFabText.match(/(\d+)시간/);
    if (durMatch) {
      parsedDuration = parseInt(durMatch[1]);
    }

    // Parse location
    if (aiFabText.includes("/")) {
      parsedLocation = aiFabText.split("/")[1].trim();
    }

    const newItem = {
      id: Date.now(),
      day: parsedDay,
      startHour: parsedHour,
      duration: parsedDuration,
      subject: parsedSubject,
      location: parsedLocation
    };

    setSchedule(prev => [...prev, newItem]);
    setAiFabText("");
    setShowAiFabInput(false);
    alert(`AI 등록 성공: ${parsedDay.toUpperCase()} ${parsedHour}시 ${parsedSubject} (${parsedDuration}시간) ${parsedLocation ? `장소: ${parsedLocation}` : ""}`);
  };

  // DevTools Cheat Handlers
  const handleCheatAdjustTimer = (seconds) => {
    window.dispatchEvent(new CustomEvent("adjust-timer-time", { detail: seconds }));
  };

  const handleCheatAddExp = (amount) => {
    addExperience(amount);
  };

  const handleCheatResetLevel = () => {
    setLevel(1);
    setExp(0);
    alert("레벨과 경험치가 Lv.1 (0 EXP)로 초기화되었습니다.");
  };

  const handleCheatResetStudyTime = () => {
    setStats(prev => ({
      ...prev,
      totalStudyMinutes: 0,
      longestSessionMinutes: 0
    }));
    setStudyMinutesBySubject({
      "수학": 0,
      "영어": 0,
      "국어": 0,
      "과학": 0,
      "사회": 0,
      "역사": 0,
      "기타": 0
    });
    setRestMinutesByType({
      "식사": 0,
      "휴식": 0,
      "수면": 0,
      "기타": 0
    });
    alert("과목별 공부시간 및 통계가 초기화되었습니다.");
  };

  const handleCheatResetAll = () => {
    if (window.confirm("정말 모든 데이터를 공장 초기화하시겠습니까? (시간표 스케줄 포함)")) {
      setSchedule([]);
      setLevel(1);
      setExp(0);
      setStats({
        totalStudyMinutes: 0,
        longestSessionMinutes: 0,
        joinedGroup: false,
        createdGroup: false,
        completedGroupGoals: 0
      });
      setStudyMinutesBySubject({
        "수학": 0,
        "영어": 0,
        "국어": 0,
        "과학": 0,
        "사회": 0,
        "역사": 0,
        "기타": 0
      });
      setRestMinutesByType({
        "식사": 0,
        "휴식": 0,
        "수면": 0,
        "기타": 0
      });
      alert("모든 데이터가 완벽히 초기화되었습니다.");
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ fontWeight: 600, color: "var(--primary-color)" }}>Loading StudyFlow...</p>
      </div>
    );
  }

  // Render Login flow if guest has not started (mock auth flow)
  // To allow checking guest mode, we proceed if user is logged in or if they are in guest session.
  // We can let them log in first.
  if (!user) {
    return (
      <div className="app-container">
        <Login />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Banner Header (Stitch design layout: Lv.1 김주환 experience bar, notification bell) */}
      <header className="app-header" style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        zIndex: 150,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
        backgroundColor: "var(--surface-color)",
        borderBottom: "1px solid var(--border-color)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => alert("프로필 메뉴 준비 중")}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {user?.photoURL ? (
                <span style={{ fontSize: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px" }}>{user.photoURL}</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--text-disabled)" }}>person</span>
              )}
              <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                Lv.{level} {user?.displayName || "게스트"}
              </span>
            </div>
            {/* Experience bar track */}
            <div style={{ marginLeft: "32px", height: "6px", width: "96px", backgroundColor: "var(--surface-container-high)", borderRadius: "9999px", overflow: "hidden", marginTop: "2px" }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.floor((exp / 1000) * 100))}%`, backgroundColor: "var(--primary-color)" }}></div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary-color)", marginRight: "8px" }}>FCAID</span>
          <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }} onClick={() => alert("현재 알림이 없습니다.")}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Content Area (padding-top to prevent overlaps) */}
      <main style={{ paddingTop: "64px", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Main Container tabs routing */}
        {activeTab === "timetable" && (
          <Timetable
            schedule={schedule || []}
            setSchedule={setSchedule}
            currentLanguage={currentLanguage}
            t={t}
            onStartTimerWithSubject={handleStartTimerWithSubject}
            subjectsList={subjectsList}
          />
        )}

        {activeTab === "timer" && (
          <StudyTimer
            activeSubject={activeSubject}
            timerMode={timerMode}
            setTimerMode={setTimerMode}
            onSaveStudySession={handleSaveStudySession}
            settings={settings || { darkMode: false, allowSpecificApps: false, flipToFocus: false, notificationType: "sound" }}
            t={t}
          />
        )}

        {activeTab === "group" && (
          <Group
            stats={stats || { totalStudyMinutes: 0, longestSessionMinutes: 0, joinedGroup: false, createdGroup: false, completedGroupGoals: 0 }}
            setStats={setStats}
            onJoinGroup={() => setStats(prev => ({ ...(prev || {}), joinedGroup: true }))}
            onCreateGroup={() => setStats(prev => ({ ...(prev || {}), joinedGroup: true, createdGroup: true }))}
            t={t}
          />
        )}

        {activeTab === "stats" && (
          <Stats
            stats={stats || { totalStudyMinutes: 0, longestSessionMinutes: 0, joinedGroup: false, createdGroup: false, completedGroupGoals: 0 }}
            level={level}
            exp={exp}
            studyMinutesBySubject={studyMinutesBySubject || {}}
            restMinutesByType={restMinutesByType || {}}
            t={t}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            settings={settings || { darkMode: false, allowSpecificApps: false, flipToFocus: false, notificationType: "sound" }}
            updateSettings={updateSettings}
            level={level}
            setLevel={setLevel}
            exp={exp}
            setExp={setExp}
            schedule={schedule || []}
            setSchedule={setSchedule}
            stats={stats || { totalStudyMinutes: 0, longestSessionMinutes: 0, joinedGroup: false, createdGroup: false, completedGroupGoals: 0 }}
            setStats={setStats}
            restMinutesByType={restMinutesByType || {}}
            setRestMinutesByType={setRestMinutesByType}
            currentLanguage={currentLanguage}
            setCurrentLanguage={setCurrentLanguage}
            t={t}
          />
        )}
      </main>

      {/* Stitch Expandable AI FAB Button */}
      {activeTab !== "timer" && (
        <div
          className="fixed bottom-[88px] right-4 z-40 flex justify-end items-center cursor-pointer"
          style={{ position: "absolute", bottom: "88px", right: "16px", zIndex: 99 }}
          onClick={() => setShowAiFabInput(!showAiFabInput)}
        >
          <div
            className="ai-fab-container bg-gradient-to-br rounded-full flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] h-14 ai-fab-glow"
            style={{
              background: "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              height: "56px",
              width: showAiFabInput ? "56px" : "220px",
              transition: "width 0.4s ease"
            }}
          >
            {!showAiFabInput && (
              <div
                className="label-text flex-1 whitespace-nowrap pl-5 text-on-primary font-bold text-label-md"
                style={{ color: "#ffffff", paddingLeft: "20px", fontSize: "12px", fontWeight: "700" }}
              >
                AI에게 질문하기...
              </div>
            )}
            <div
              className="w-14 h-14 shrink-0 flex items-center justify-center text-on-primary rounded-full"
              style={{ width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}
            >
              <span className="material-symbols-outlined material-filled text-[28px]">auto_awesome</span>
            </div>
          </div>
        </div>
      )}

      {/* AI FAB Quick Text Input Drawer */}
      {showAiFabInput && (
        <div className="modal-overlay" onClick={() => setShowAiFabInput(false)} style={{ zIndex: 199 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ borderBottom: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-outlined text-primary material-filled">auto_awesome</span>
                AI 인공지능 일정 등록기
              </span>
              <span className="material-symbols-outlined" onClick={() => setShowAiFabInput(false)} style={{ cursor: "pointer" }}>close</span>
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="input-field"
                placeholder={t.aiPlaceholder}
                value={aiFabText}
                onChange={e => setAiFabText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" style={{ width: "auto", padding: "10px" }} onClick={handleAiFabSubmit}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DevTools Floating Button */}
      <div
        className="cursor-pointer"
        style={{
          position: "absolute",
          bottom: activeTab !== "timer" ? "152px" : "88px",
          right: "16px",
          zIndex: 99,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1.5px solid rgba(78, 205, 196, 0.4)",
          transition: "bottom 0.3s ease"
        }}
        onClick={() => setShowDevTools(!showDevTools)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>build</span>
      </div>

      {/* DevTools Panel (Non-blocking Floating Card) */}
      {showDevTools && (
        <div style={{
          position: "absolute",
          bottom: activeTab !== "timer" ? "216px" : "152px",
          right: "16px",
          width: "280px",
          maxHeight: "360px",
          overflowY: "auto",
          backgroundColor: "rgba(17, 24, 39, 0.96)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(78, 205, 196, 0.4)",
          borderRadius: "16px",
          padding: "16px",
          zIndex: 199,
          color: "#f3f4f6",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          scrollbarWidth: "none",
          transition: "bottom 0.3s ease"
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", color: "#4ecdc4" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>build</span>
              🛠️ 개발자 도구 (Cheat Panel)
            </span>
            <span className="material-symbols-outlined" onClick={() => setShowDevTools(false)} style={{ cursor: "pointer", color: "#9ca3af", fontSize: "18px" }}>close</span>
          </div>

          {/* Quick Status */}
          <div style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
            padding: "8px",
            fontSize: "11px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            border: "1px solid rgba(255,255,255,0.06)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>레벨 / 경험치</span>
              <span style={{ fontWeight: "700", color: "#ffffff" }}>Lv.{level} ({exp}/1000 EXP)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>누적 공부 시간</span>
              <span style={{ fontWeight: "700", color: "#ffffff" }}>{Math.floor(stats.totalStudyMinutes / 60)}시간 {stats.totalStudyMinutes % 60}분</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>그룹 참여 현황</span>
              <span style={{ fontWeight: "700", color: stats.joinedGroup ? "#10b981" : "#ef4444" }}>
                {stats.joinedGroup ? "참가 중" : "미참가"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Timer Cheats */}
            <div>
              <span style={{ fontSize: "9px", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                타이머 시간 조작
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px" }} onClick={() => handleCheatAdjustTimer(300)}>
                  +5분
                </button>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px" }} onClick={() => handleCheatAdjustTimer(-300)}>
                  -5분
                </button>
              </div>
            </div>

            {/* EXP Cheats */}
            <div>
              <span style={{ fontSize: "9px", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                경험치 및 레벨 조작
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px", flex: "1 1 45%" }} onClick={() => handleCheatAddExp(50)}>
                  +50 EXP
                </button>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px", flex: "1 1 45%" }} onClick={() => handleCheatAddExp(200)}>
                  +200 EXP
                </button>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px", flex: "1 1 45%" }} onClick={() => setLevel(prev => prev + 1)}>
                  레벨 +1
                </button>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px", flex: "1 1 45%" }} onClick={() => setLevel(prev => Math.max(1, prev - 1))}>
                  레벨 -1
                </button>
              </div>
            </div>

            {/* Group Cheats */}
            <div>
              <span style={{ fontSize: "9px", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                그룹 및 데이터 조작
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px" }} onClick={() => {
                  setStats(prev => ({
                    ...prev,
                    joinedGroup: !prev.joinedGroup,
                    createdGroup: !prev.joinedGroup ? true : false
                  }));
                  alert(`그룹 상태가 ${!stats.joinedGroup ? "참가" : "탈퇴"}로 조작되었습니다.`);
                }}>
                  그룹 {stats.joinedGroup ? "탈퇴" : "참가"} 토글
                </button>
                <button className="btn btn-secondary" style={{ backgroundColor: "#1f2937", color: "#ffffff", borderColor: "rgba(255,255,255,0.08)", padding: "6px", fontSize: "11px" }} onClick={() => {
                  setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
                }}>
                  다크모드 토글
                </button>
              </div>
            </div>

            {/* Reset Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px", marginTop: "2px" }}>
              <button className="btn" style={{ backgroundColor: "#374151", color: "#ffffff", padding: "8px", fontSize: "11px" }} onClick={handleCheatResetLevel}>
                레벨 및 경험치 초기화
              </button>
              <button className="btn" style={{ backgroundColor: "#991b1b", color: "#ffffff", padding: "8px", fontSize: "11px" }} onClick={handleCheatResetStudyTime}>
                공부시간 및 통계 초기화
              </button>
              <button className="btn" style={{ backgroundColor: "#7f1d1d", color: "#fca5a5", padding: "8px", fontSize: "11px", fontWeight: "800" }} onClick={handleCheatResetAll}>
                ⚠️ 공장 전체 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tabs Navigation Bar (Stitch icon elements) */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "timetable" ? "active" : ""}`}
          onClick={() => setActiveTab("timetable")}
          style={{ background: "none", border: "none" }}
        >
          <span className={`material-symbols-outlined mb-1 ${activeTab === "timetable" ? "material-filled" : ""}`}>calendar_view_day</span>
          <span>{t.timetable}</span>
        </button>
        <button
          className={`nav-item ${activeTab === "timer" ? "active" : ""}`}
          onClick={() => setActiveTab("timer")}
          style={{ background: "none", border: "none" }}
        >
          <span className={`material-symbols-outlined mb-1 ${activeTab === "timer" ? "material-filled" : ""}`}>timer</span>
          <span>{t.timer}</span>
        </button>
        <button
          className={`nav-item ${activeTab === "group" ? "active" : ""}`}
          onClick={() => setActiveTab("group")}
          style={{ background: "none", border: "none" }}
        >
          <span className={`material-symbols-outlined mb-1 ${activeTab === "group" ? "material-filled" : ""}`}>group</span>
          <span>{t.group}</span>
        </button>
        <button
          className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
          style={{ background: "none", border: "none" }}
        >
          <span className={`material-symbols-outlined mb-1 ${activeTab === "stats" ? "material-filled" : ""}`}>insights</span>
          <span>{t.stats}</span>
        </button>
        <button
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
          style={{ background: "none", border: "none" }}
        >
          <span className={`material-symbols-outlined mb-1 ${activeTab === "settings" ? "material-filled" : ""}`}>settings</span>
          <span>{t.settings}</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
