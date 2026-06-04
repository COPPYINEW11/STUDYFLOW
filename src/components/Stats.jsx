import { useState } from "react";

export const Stats = ({
  stats = {
    totalStudyMinutes: 0,
    longestSessionMinutes: 0,
    joinedGroup: false,
    createdGroup: false,
    completedGroupGoals: 0
  },
  level = 1,
  exp = 0,
  studyMinutesBySubject = {},
  restMinutesByType = {}
}) => {
  const [chartTab, setChartTab] = useState("weekly"); // daily | weekly | monthly

  // Safe Fallback configurations
  const defaultStats = {
    totalStudyMinutes: 0,
    longestSessionMinutes: 0,
    joinedGroup: false,
    createdGroup: false,
    completedGroupGoals: 0
  };
  
  const safeStats = stats && typeof stats === "object" ? { ...defaultStats, ...stats } : defaultStats;
  
  const defaultStudyMinutes = {
    "수학": 0,
    "영어": 0,
    "국어": 0,
    "과학": 0,
    "사회": 0,
    "역사": 0,
    "기타": 0
  };
  const safeStudyMinutes = studyMinutesBySubject && typeof studyMinutesBySubject === "object" 
    ? { ...defaultStudyMinutes, ...studyMinutesBySubject } 
    : defaultStudyMinutes;

  const defaultRestMinutes = {
    "식사": 0,
    "휴식": 0,
    "수면": 0,
    "기타": 0
  };
  const safeRestMinutes = restMinutesByType && typeof restMinutesByType === "object"
    ? { ...defaultRestMinutes, ...restMinutesByType }
    : defaultRestMinutes;

  const EXP_PER_LEVEL = 1000;
  const expProgressPercent = Math.min(100, Math.floor((exp / EXP_PER_LEVEL) * 100));

  // Dynamic Chart Data based on Segment selection
  const getChartData = () => {
    switch (chartTab) {
      case "daily":
        return [
          { label: "09시", minutes: 30 },
          { label: "11시", minutes: 50 },
          { label: "13시", minutes: 120 },
          { label: "15시", minutes: 60 },
          { label: "17시", minutes: 10 },
          { label: "19시", minutes: 90 },
          { label: "현재", minutes: safeStats.totalStudyMinutes % 120 }
        ];
      case "monthly":
        return [
          { label: "1주차", minutes: 800 },
          { label: "2주차", minutes: 1200 },
          { label: "3주차", minutes: 650 },
          { label: "4주차", minutes: 1500 },
          { label: "5주차", minutes: safeStats.totalStudyMinutes }
        ];
      case "weekly":
      default:
        return [
          { label: "월", minutes: 120 },
          { label: "화", minutes: 180 },
          { label: "수", minutes: 90 },
          { label: "목", minutes: 240 },
          { label: "금", minutes: 150 },
          { label: "토", minutes: 300 },
          { label: "일", minutes: safeStats.totalStudyMinutes % 180 }
        ];
    }
  };

  const chartData = getChartData();
  const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60);

  // Top 3 Subjects sorting
  const sortedSubjects = Object.entries(safeStudyMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Rest Distribution calculation
  const totalRestMinutes = Object.values(safeRestMinutes).reduce((a, b) => a + b, 0) || 1;

  // Achievements evaluation
  const achievements = [
    { id: "start", title: "시작", desc: "10분 공부하기", condition: safeStats.totalStudyMinutes >= 10 },
    { id: "consistency", title: "꾸준함", desc: "7일 연속 공부 기록", condition: safeStats.totalStudyMinutes >= 350 },
    { id: "focus", title: "집중력", desc: "한 번에 2시간 이상 공부", condition: safeStats.longestSessionMinutes >= 120 },
    { id: "diligent", title: "노력가", desc: "누적 100시간 공부", condition: safeStats.totalStudyMinutes >= 6000 },
    { id: "master", title: "마스터", desc: "누적 1000시간 공부", condition: safeStats.totalStudyMinutes >= 60000 },
    { id: "group", title: "소통", desc: "그룹 참가", condition: safeStats.joinedGroup },
    { id: "collab", title: "협동", desc: "그룹 목표 3회 달성", condition: safeStats.completedGroupGoals >= 3 },
    { id: "leader", title: "리더", desc: "그룹 생성", condition: safeStats.createdGroup }
  ];

  return (
    <div className="scrollable">
      {/* Experience Level Banner */}
      <div className="glass-card" style={{ background: "linear-gradient(135deg, var(--primary-color) 0%, #3f51b5 100%)", color: "#ffffff", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <span style={{ fontSize: "11px", opacity: 0.8, fontWeight: "700" }}>현재 학습 등급</span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              Lv. {level}
            </h2>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)",
            padding: "8px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span className="material-symbols-outlined text-[32px]">award</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.9, marginBottom: "4px" }}>
          <span>EXP {exp} / {EXP_PER_LEVEL}</span>
          <span>{expProgressPercent}%</span>
        </div>
        <div className="progress-bar-track" style={{ backgroundColor: "rgba(255,255,255,0.2)", height: "10px" }}>
          <div className="progress-bar-fill" style={{ width: `${expProgressPercent}%`, backgroundColor: "#ffffff" }} />
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div className="glass-card" style={{ margin: 0, padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary-color)", marginBottom: "4px" }}>
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span style={{ fontSize: "11px", fontWeight: "700" }}>누적 학습 시간</span>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{Math.floor(safeStats.totalStudyMinutes / 60)}h {safeStats.totalStudyMinutes % 60}m</h3>
        </div>

        <div className="glass-card" style={{ margin: 0, padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-color)", marginBottom: "4px" }}>
            <span className="material-symbols-outlined text-[18px] material-filled">bolt</span>
            <span style={{ fontSize: "11px", fontWeight: "700" }}>최장 집중 세션</span>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{safeStats.longestSessionMinutes}m</h3>
        </div>
      </div>

      {/* Study Graph with Tab Swapping */}
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined text-primary">trending_up</span>
            학습 시간 분석
          </h3>
          <div className="segmented-control" style={{ margin: 0, padding: "2px", fontSize: "10px" }}>
            <button 
              className={`segment-btn ${chartTab === "daily" ? "active" : ""}`}
              onClick={() => setChartTab("daily")}
              style={{ padding: "4px 8px", fontSize: "11px" }}
            >
              일간
            </button>
            <button 
              className={`segment-btn ${chartTab === "weekly" ? "active" : ""}`}
              onClick={() => setChartTab("weekly")}
              style={{ padding: "4px 8px", fontSize: "11px" }}
            >
              주간
            </button>
            <button 
              className={`segment-btn ${chartTab === "monthly" ? "active" : ""}`}
              onClick={() => setChartTab("monthly")}
              style={{ padding: "4px 8px", fontSize: "11px" }}
            >
              월간
            </button>
          </div>
        </div>
        
        {/* Dynamic customized Bar Chart */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "140px", padding: "0 8px 8px 8px" }}>
          {chartData.map((d, index) => {
            const barHeightPercent = (d.minutes / maxMinutes) * 100;
            return (
              <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: `${80 / chartData.length}%`, gap: "8px" }}>
                <span style={{ fontSize: "8px", fontWeight: "700", color: "var(--text-secondary)" }}>{d.minutes}m</span>
                <div style={{
                  width: "100%",
                  height: `${Math.max(4, barHeightPercent)}px`,
                  background: index === chartData.length - 1 
                    ? "linear-gradient(180deg, var(--accent-color) 0%, #ff5722 100%)"
                    : "linear-gradient(180deg, var(--primary-color) 0%, #3f51b5 100%)",
                  borderRadius: "4px",
                  transition: "height 0.4s ease-out"
                }} />
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-disabled)" }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donut Chart: Study Character Analysis */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined text-primary">pie_chart</span>
          학습 성격 분석
        </h3>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 0" }}>
          {/* Donut chart mockup via CSS gradients */}
          <div style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "conic-gradient(var(--primary-color) 0% 50%, var(--secondary-color) 50% 80%, var(--accent-color) 80% 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-low)"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--surface-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "800",
              color: "var(--text-primary)"
            }}>
              계획 수립
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--primary-color)" }} />
              <span style={{ fontWeight: "700" }}>집중형 (50%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--secondary-color)" }} />
              <span style={{ fontWeight: "700" }}>계획형 (30%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--accent-color)" }} />
              <span style={{ fontWeight: "700" }}>벼락치기형 (20%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Subjects */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined text-secondary">menu_book</span>
          가장 많이 공부한 과목 Top 3
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sortedSubjects.map(([subName, mins], idx) => {
            const percent = safeStats.totalStudyMinutes ? Math.min(100, Math.round((mins / safeStats.totalStudyMinutes) * 100)) : 0;
            return (
              <div key={subName} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--surface-container-high)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--primary-color)"
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    <span>{subName}</span>
                    <span>{mins}분 ({percent}%)</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: subName === "수학" ? "var(--sub-math)" : subName === "영어" ? "var(--sub-english)" : "var(--sub-korean)"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {sortedSubjects.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--text-disabled)", fontSize: "12px" }}>아직 기록된 과목별 학습 정보가 없습니다.</p>
          )}
        </div>
      </div>

      {/* Rest Types Distribution */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined text-accent">local_cafe</span>
          휴식 유형별 비율
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.entries(safeRestMinutes).map(([type, mins]) => {
            const percent = Math.min(100, Math.round((mins / totalRestMinutes) * 100));
            return (
              <div key={type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <span style={{ fontWeight: "700", width: "40px" }}>{type}</span>
                <div className="progress-bar-track" style={{ flex: 1, margin: "0 12px" }}>
                  <div className="progress-bar-fill accent" style={{ width: `${percent}%`, backgroundColor: "var(--accent-color)" }} />
                </div>
                <span style={{ fontWeight: "600", width: "50px", textAlign: "right" }}>{mins}m ({percent}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements System Grid */}
      <div className="glass-card">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined text-accent material-filled">auto_awesome</span>
          학습 업적 달성 현황
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {achievements.map(ach => (
            <div
              key={ach.id}
              style={{
                border: `1px solid ${ach.condition ? "var(--secondary-color)" : "var(--border-color)"}`,
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                gap: "8px",
                backgroundColor: ach.condition ? "rgba(0, 107, 92, 0.03)" : "transparent",
                opacity: ach.condition ? 1 : 0.6,
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ color: ach.condition ? "var(--secondary-color)" : "var(--text-disabled)", marginTop: "2px" }}>
                <span className={`material-symbols-outlined ${ach.condition ? "material-filled" : ""}`} style={{ fontSize: "16px", color: ach.condition ? "var(--secondary-color)" : "currentColor" }}>check_circle</span>
              </div>
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "700", color: ach.condition ? "var(--secondary-color)" : "var(--text-primary)" }}>
                  {ach.title}
                </h4>
                <p style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
