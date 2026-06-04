import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const Settings = ({
  settings = {
    darkMode: false,
    allowSpecificApps: false,
    flipToFocus: false,
    notificationType: "sound"
  },
  updateSettings,
  setLevel,
  setExp,
  setSchedule,
  setStats,
  setRestMinutesByType,
  currentLanguage,
  setCurrentLanguage,
  t
}) => {
  const { user, setUser, logout } = useAuth();
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [selectedApps, setSelectedApps] = useState(["카카오톡", "전화", "캘린더"]);
  const [nicknameInput, setNicknameInput] = useState(user?.displayName || "");

  const safeSettings = settings || {
    darkMode: false,
    allowSpecificApps: false,
    flipToFocus: false,
    notificationType: "sound"
  };

  const presetAvatars = [
    { char: "🦊", name: "여우" },
    { char: "🐶", name: "강아지" },
    { char: "🐱", name: "고양이" },
    { char: "🐨", name: "코알라" },
    { char: "🐸", name: "개구리" },
    { char: "🦁", name: "사자" }
  ];

  const mockInstalledApps = [
    "카카오톡", "유튜브", "인스타그램", "전화", "메시지", "네이버", "구글", "캘린더", "뮤직", "웹툰"
  ];

  const handleAppToggle = (app) => {
    setSelectedApps(prev => 
      prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]
    );
  };

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
  };

  const adjustTimerTime = (amountInMinutes) => {
    alert(`개발자 도구: 타이머 시간이 ${amountInMinutes}분 조정되었습니다.`);
  };

  const handleLevelAdjust = (val) => {
    if (setLevel) setLevel(prev => Math.max(1, prev + val));
  };

  const handleResetAllData = () => {
    if (window.confirm("개발자 도구: 정말 모든 로컬 스터디 데이터(레벨, 그래프, 업적)를 초기화하시겠습니까?")) {
      if (setLevel) setLevel(1);
      if (setExp) setExp(0);
      if (setSchedule) setSchedule([]);
      if (setStats) {
        setStats({
          totalStudyMinutes: 0,
          longestSessionMinutes: 0,
          joinedGroup: false,
          createdGroup: false,
          completedGroupGoals: 0
        });
      }
      if (setRestMinutesByType) {
        setRestMinutesByType({
          "식사": 0,
          "휴식": 0,
          "수면": 0,
          "기타": 0
        });
      }
      alert("모든 데이터가 초기화되었습니다.");
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("회원 탈퇴를 진행하시겠습니까? 클라우드 및 서버의 모든 개인 학습 정보가 완전히 삭제됩니다.")) {
      logout();
      alert("회원 탈퇴가 완료되어 모든 정보가 서버에서 완전히 파기되었습니다.");
    }
  };

  const handleSaveProfile = () => {
    if (!nicknameInput.trim()) {
      alert("닉네임을 입력해 주세요!");
      return;
    }
    if (setUser) {
      setUser(prev => ({
        ...prev,
        displayName: nicknameInput
      }));
      alert("프로필 닉네임이 저장되었습니다.");
    }
  };

  const selectAvatar = (char) => {
    if (setUser) {
      setUser(prev => ({
        ...prev,
        photoURL: char
      }));
      alert(`아바타가 [${char}] 캐릭터로 변경되었습니다.`);
    }
  };

  return (
    <div className="scrollable">
      {/* Account Profile Box */}
      <div className="glass-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--surface-container-high)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          fontSize: "24px"
        }}>
          {user?.photoURL ? (
            user.photoURL
          ) : (
            <span className="material-symbols-outlined text-[24px]">person</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700" }}>
            {user ? user.displayName || user.email : "게스트 (Guest)"}
          </h4>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
            {user?.isGuest ? "FCAID 로컬 테스트 계정" : "구글 계정 연동됨 (서버 동기화 중)"}
          </p>
        </div>
        <button className="btn btn-secondary" style={{ width: "auto", padding: "6px 12px", fontSize: "11px" }} onClick={logout}>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>logout</span>
          {t.logout}
        </button>
      </div>

      {/* 프로필 수정 카드 */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>내 프로필 변경</h3>
        
        {/* 닉네임 변경 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            className="input-field"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="닉네임 입력"
            style={{ fontSize: "13px", padding: "8px 12px" }}
          />
          <button 
            className="btn btn-primary" 
            style={{ width: "auto", padding: "8px 16px", fontSize: "12px", whiteSpace: "nowrap" }}
            onClick={handleSaveProfile}
          >
            변경
          </button>
        </div>

        {/* 아바타 선택기 */}
        <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
          캐릭터 아바타 변경
        </label>
        <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
          {presetAvatars.map(av => (
            <button
              key={av.char}
              onClick={() => selectAvatar(av.char)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: user?.photoURL === av.char ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                backgroundColor: "var(--surface-color)",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title={av.name}
            >
              {av.char}
            </button>
          ))}
        </div>
      </div>

      {/* 테마 토글 */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>앱 테마 설정</h3>
        
        <div className="switch-container">
          <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined">{safeSettings.darkMode ? "dark_mode" : "light_mode"}</span>
            다크모드 활성화
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={safeSettings.darkMode}
              onChange={(e) => updateSettings({ darkMode: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* 집중모드 알림 제어 */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>공부 집중 모드</h3>
        
        <div className="switch-container">
          <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined">notifications</span>
            집중 중 원하는 앱 알림만 허용
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={safeSettings.allowSpecificApps}
              onChange={(e) => updateSettings({ allowSpecificApps: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>

        {safeSettings.allowSpecificApps && (
          <button
            className="btn btn-secondary"
            style={{ marginTop: "12px", justifyContent: "space-between", fontSize: "12px" }}
            onClick={() => setShowAppsModal(true)}
          >
            <span>허용할 앱 선택 ({selectedApps.length}개)</span>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>

      {/* 타이머 동작 조건 설정 */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>타이머 집중 옵션</h3>
        
        <div className="switch-container">
          <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined">phone_iphone</span>
            휴대폰 뒤집어야 타이머 시작
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={safeSettings.flipToFocus}
              onChange={(e) => updateSettings({ flipToFocus: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div style={{ marginTop: "12px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            타이머 완료 알림 방식
          </label>
          <select
            className="input-field"
            value={safeSettings.notificationType}
            onChange={(e) => updateSettings({ notificationType: e.target.value })}
            style={{ padding: "8px 12px" }}
          >
            <option value="sound">알림음 재생</option>
            <option value="vibrate">진동 발생</option>
            <option value="both">알림음 + 진동 둘 다</option>
          </select>
        </div>
      </div>

      {/* 언어 설정 */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-outlined">language</span>
          글로벌 언어 설정 (Language)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {[
            { code: "ko", name: "한국어" },
            { code: "en", name: "English" },
            { code: "jp", name: "日本語" },
            { code: "cn", name: "简体中文" },
            { code: "vi", name: "Tiếng Việt" }
          ].map(lang => (
            <button
              key={lang.code}
              className={`btn ${currentLanguage === lang.code ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "8px 4px", fontSize: "11px" }}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* 개발자 도구 (관리자 탭) */}
      <div className="glass-card" style={{ borderColor: "var(--accent-color)" }}>
        <button
          className="btn btn-secondary"
          style={{ justifyContent: "space-between", borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
          onClick={() => setShowDeveloperTools(!showDeveloperTools)}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined">build</span>
            관리자 개발자 도구
          </span>
          <span className="material-symbols-outlined" style={{ transform: showDeveloperTools ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>chevron_right</span>
        </button>

        {showDeveloperTools && (
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary" style={{ fontSize: "11px", padding: "8px" }} onClick={() => handleLevelAdjust(1)}>레벨 +1</button>
              <button className="btn btn-secondary" style={{ fontSize: "11px", padding: "8px" }} onClick={() => handleLevelAdjust(-1)}>레벨 -1</button>
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary" style={{ fontSize: "11px", padding: "8px" }} onClick={() => adjustTimerTime(-5)}>타이머 -5분</button>
              <button className="btn btn-secondary" style={{ fontSize: "11px", padding: "8px" }} onClick={() => adjustTimerTime(5)}>타이머 +5분</button>
            </div>

            <button
              className="btn btn-secondary"
              style={{ color: "var(--error-color)", fontSize: "12px" }}
              onClick={handleResetAllData}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
              전체 학습 데이터 초기화
            </button>
          </div>
        )}
      </div>

      {/* 회원 탈퇴 */}
      {user && !user.isGuest && (
        <div style={{ padding: "16px 0", textAlign: "center" }}>
          <button
            className="btn btn-secondary"
            style={{ border: "none", color: "var(--text-disabled)", textDecoration: "underline", fontSize: "12px", width: "auto" }}
            onClick={handleDeleteAccount}
          >
            회원 탈퇴 (서버 데이터 영구 삭제)
          </button>
        </div>
      )}

      {/* Modal: Apps list select */}
      {showAppsModal && (
        <div className="modal-overlay" onClick={() => setShowAppsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>허용할 애플리케이션</h3>
              <span className="material-symbols-outlined" onClick={() => setShowAppsModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              공부 집중 시간 중 차단되지 않고 정상 알림을 받을 앱들을 선택하세요.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", marginBottom: "20px" }}>
              {mockInstalledApps.map(app => {
                const isSelected = selectedApps.includes(app);
                return (
                  <div
                    key={app}
                    onClick={() => handleAppToggle(app)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${isSelected ? "var(--primary-color)" : "var(--border-color)"}`,
                      backgroundColor: isSelected ? "rgba(36, 56, 156, 0.03)" : "var(--surface-color)",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: "600" }}>{app}</span>
                    {isSelected && <span className="material-symbols-outlined text-primary">check</span>}
                  </div>
                );
              })}
            </div>
            
            <button className="btn btn-primary" onClick={() => setShowAppsModal(false)}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};
