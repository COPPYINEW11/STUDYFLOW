import { useState, useEffect, useRef } from "react";

// 숫자 카운터 애니메이션 훅
function useCountUp(target, duration = 800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) { setCount(target); return; }
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// SVG 도넛 차트 컴포넌트
function DonutChart({ segments, size = 110, thickness = 18 }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  let cumulative = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--surface-container-high)" strokeWidth={thickness} />
      {segments.map((seg, i) => {
        const segLength = (seg.value / total) * circumference;
        const offset = circumference - (animated ? cumulative / total * circumference : circumference);
        const element = (
          <circle
            key={i}
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${animated ? segLength : 0} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: `stroke-dasharray 0.8s cubic-bezier(0.25,0.8,0.25,1) ${i * 0.15}s, stroke-dashoffset 0.8s cubic-bezier(0.25,0.8,0.25,1) ${i * 0.15}s` }}
          />
        );
        cumulative += seg.value;
        return element;
      })}
    </svg>
  );
}

// 바 차트 컴포넌트
function BarChart({ data, maxVal }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "130px", padding: "0 4px 8px 4px" }}>
      {data.map((d, index) => {
        const barHeightPercent = visible ? (d.minutes / maxVal) * 100 : 0;
        const isLast = index === data.length - 1;
        return (
          <div
            key={d.label + index}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "6px", maxWidth: "48px" }}
          >
            <span style={{
              fontSize: "8px", fontWeight: "700",
              color: isLast ? "var(--accent-color)" : "var(--text-secondary)",
              opacity: visible ? 1 : 0,
              transition: `opacity 0.3s ease ${index * 0.06}s`
            }}>{d.minutes}m</span>
            <div style={{
              width: "calc(100% - 8px)",
              height: `${Math.max(4, barHeightPercent)}px`,
              background: isLast
                ? "linear-gradient(180deg, var(--accent-color) 0%, #e65100 100%)"
                : "linear-gradient(180deg, var(--primary-color) 0%, #3949ab 100%)",
              borderRadius: "6px 6px 3px 3px",
              transition: `height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.06}s`,
              boxShadow: isLast ? "0 2px 8px rgba(255,152,0,0.4)" : "0 2px 6px rgba(36,56,156,0.2)",
              cursor: "pointer",
              position: "relative"
            }} />
            <span style={{
              fontSize: "10px", fontWeight: "600",
              color: isLast ? "var(--accent-color)" : "var(--text-disabled)",
              fontWeight: isLast ? "800" : "600"
            }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

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
  const [chartTab, setChartTab] = useState("weekly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const defaultStats = {
    totalStudyMinutes: 0, longestSessionMinutes: 0,
    joinedGroup: false, createdGroup: false, completedGroupGoals: 0
  };
  const safeStats = stats && typeof stats === "object" ? { ...defaultStats, ...stats } : defaultStats;

  const defaultStudyMinutes = { "수학": 0, "영어": 0, "국어": 0, "과학": 0, "사회": 0, "역사": 0, "기타": 0 };
  const safeStudyMinutes = studyMinutesBySubject && typeof studyMinutesBySubject === "object"
    ? { ...defaultStudyMinutes, ...studyMinutesBySubject } : defaultStudyMinutes;

  const defaultRestMinutes = { "식사": 0, "휴식": 0, "수면": 0, "기타": 0 };
  const safeRestMinutes = restMinutesByType && typeof restMinutesByType === "object"
    ? { ...defaultRestMinutes, ...restMinutesByType } : defaultRestMinutes;

  const EXP_PER_LEVEL = 1000;
  const expProgressPercent = Math.min(100, Math.floor((exp / EXP_PER_LEVEL) * 100));

  // 카운터 애니메이션
  const animatedHours = useCountUp(Math.floor(safeStats.totalStudyMinutes / 60), 900, mounted);
  const animatedMins = useCountUp(safeStats.totalStudyMinutes % 60, 900, mounted);
  const animatedLongest = useCountUp(safeStats.longestSessionMinutes, 900, mounted);

  const getChartData = () => {
    switch (chartTab) {
      case "daily":
        return [
          { label: "09시", minutes: 30 }, { label: "11시", minutes: 50 },
          { label: "13시", minutes: 120 }, { label: "15시", minutes: 60 },
          { label: "17시", minutes: 10 }, { label: "19시", minutes: 90 },
          { label: "현재", minutes: safeStats.totalStudyMinutes % 120 }
        ];
      case "monthly":
        return [
          { label: "1주", minutes: 800 }, { label: "2주", minutes: 1200 },
          { label: "3주", minutes: 650 }, { label: "4주", minutes: 1500 },
          { label: "5주", minutes: safeStats.totalStudyMinutes }
        ];
      default:
        return [
          { label: "월", minutes: 120 }, { label: "화", minutes: 180 },
          { label: "수", minutes: 90 }, { label: "목", minutes: 240 },
          { label: "금", minutes: 150 }, { label: "토", minutes: 300 },
          { label: "일", minutes: safeStats.totalStudyMinutes % 180 }
        ];
    }
  };

  const chartData = getChartData();
  const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60);

  const sortedSubjects = Object.entries(safeStudyMinutes)
    .sort((a, b) => b[1] - a[1]).slice(0, 3);

  const totalRestMinutes = Object.values(safeRestMinutes).reduce((a, b) => a + b, 0) || 1;

  // 도넛 차트 데이터
  const studyTotal = Object.values(safeStudyMinutes).reduce((a, b) => a + b, 0);
  const donutSegments = studyTotal > 0
    ? [
        { value: (safeStudyMinutes["수학"] || 0), color: "var(--sub-math)", label: "수학" },
        { value: (safeStudyMinutes["영어"] || 0), color: "var(--sub-english)", label: "영어" },
        { value: (safeStudyMinutes["국어"] || 0), color: "var(--sub-korean)", label: "국어" },
        { value: (safeStudyMinutes["과학"] || 0), color: "var(--sub-science)", label: "과학" },
        { value: Object.values(safeStudyMinutes).reduce((a, b) => a + b, 0)
            - (safeStudyMinutes["수학"] || 0) - (safeStudyMinutes["영어"] || 0)
            - (safeStudyMinutes["국어"] || 0) - (safeStudyMinutes["과학"] || 0),
          color: "var(--sub-etc)", label: "기타" }
      ].filter(s => s.value > 0)
    : [{ value: 1, color: "var(--surface-container-high)", label: "" }];

  const achievements = [
    { id: "start", title: "🌱 시작", desc: "10분 공부하기", condition: safeStats.totalStudyMinutes >= 10 },
    { id: "consistency", title: "📅 꾸준함", desc: "누적 6시간 공부", condition: safeStats.totalStudyMinutes >= 360 },
    { id: "focus", title: "🎯 집중력", desc: "한 번에 2시간 집중", condition: safeStats.longestSessionMinutes >= 120 },
    { id: "diligent", title: "⚡ 노력가", desc: "누적 100시간 달성", condition: safeStats.totalStudyMinutes >= 6000 },
    { id: "master", title: "🏆 마스터", desc: "누적 1000시간", condition: safeStats.totalStudyMinutes >= 60000 },
    { id: "group", title: "🤝 소통", desc: "그룹 참가", condition: safeStats.joinedGroup },
    { id: "collab", title: "🎖 협동", desc: "그룹 목표 3회 달성", condition: safeStats.completedGroupGoals >= 3 },
    { id: "leader", title: "👑 리더", desc: "그룹 생성하기", condition: safeStats.createdGroup }
  ];

  const getTierInfo = (lv) => {
    if (lv >= 50) return { label: "전설", emoji: "👑", color: "#FFD700", bg: "linear-gradient(135deg, #8B6914 0%, #C9973A 100%)" };
    if (lv >= 30) return { label: "다이아", emoji: "💎", color: "#B9F2FF", bg: "linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)" };
    if (lv >= 20) return { label: "플래티넘", emoji: "🏅", color: "#E0F7FA", bg: "linear-gradient(135deg, #00695C 0%, #26A69A 100%)" };
    if (lv >= 10) return { label: "골드", emoji: "🥇", color: "#FFF9C4", bg: "linear-gradient(135deg, #F57F17 0%, #FFCA28 100%)" };
    if (lv >= 5)  return { label: "실버", emoji: "🥈", color: "#F5F5F5", bg: "linear-gradient(135deg, #546E7A 0%, #90A4AE 100%)" };
    return { label: "브론즈", emoji: "🥉", color: "#FFE0B2", bg: "linear-gradient(135deg, #4E342E 0%, #A1887F 100%)" };
  };

  const tier = getTierInfo(level);
  const subjectColors = {
    "수학": "var(--sub-math)", "영어": "var(--sub-english)", "국어": "var(--sub-korean)",
    "과학": "var(--sub-science)", "사회": "var(--sub-social)", "역사": "var(--sub-history)", "기타": "var(--sub-etc)"
  };

  return (
    <div className="scrollable">

      {/* 레벨 배너 */}
      <div
        className="tier-banner slide-in-up"
        style={{
          background: tier.bg,
          color: "#ffffff",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "12px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* 데코 서클 */}
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20px", left: "40%", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span style={{ fontSize: "10px", opacity: 0.85, fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", display: "block" }}>현재 학습 등급</span>
            <h2 style={{ fontSize: "32px", fontWeight: "900", marginTop: "2px", letterSpacing: "-1px" }} className="number-pop stagger-2">
              Lv. {level}
            </h2>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            padding: "12px 18px",
            borderRadius: "16px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)"
          }} className="badge-shine">
            <span style={{ fontSize: "28px", lineHeight: 1 }}>{tier.emoji}</span>
            <span style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "0.5px" }}>{tier.label}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.9, marginBottom: "6px" }}>
          <span>EXP {exp} / {EXP_PER_LEVEL}</span>
          <span style={{ fontWeight: "800" }}>{expProgressPercent}%</span>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,0.2)", height: "10px", borderRadius: "9999px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: mounted ? `${expProgressPercent}%` : "0%",
            backgroundColor: "#ffffff",
            borderRadius: "9999px",
            transition: "width 1.0s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s",
            boxShadow: "0 0 10px rgba(255,255,255,0.7)"
          }} />
        </div>
      </div>

      {/* 요약 카드 2개 */}
      <div className="slide-in-up stagger-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <div className="glass-card" style={{ margin: 0, padding: "14px", textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "var(--primary-color)" }}>schedule</span>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", margin: "4px 0" }}>누적 학습</p>
          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary-color)", lineHeight: 1.1 }}>
            {animatedHours}<span style={{ fontSize: "13px" }}>h</span> {animatedMins}<span style={{ fontSize: "13px" }}>m</span>
          </h3>
        </div>
        <div className="glass-card" style={{ margin: 0, padding: "14px", textAlign: "center" }}>
          <span className="material-symbols-outlined material-filled" style={{ fontSize: "22px", color: "var(--accent-color)" }}>bolt</span>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", margin: "4px 0" }}>최장 집중</p>
          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent-color)", lineHeight: 1.1 }}>
            {animatedLongest}<span style={{ fontSize: "13px" }}>m</span>
          </h3>
        </div>
      </div>

      {/* 바 차트 */}
      <div className="glass-card slide-in-up stagger-3">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--primary-color)" }}>trending_up</span>
            학습 시간 분석
          </h3>
          <div className="segmented-control" style={{ margin: 0, padding: "2px" }}>
            {["daily", "weekly", "monthly"].map(tab => (
              <button
                key={tab}
                className={`segment-btn ${chartTab === tab ? "active" : ""}`}
                onClick={() => setChartTab(tab)}
                style={{ padding: "4px 8px", fontSize: "10px" }}
              >
                {tab === "daily" ? "일간" : tab === "weekly" ? "주간" : "월간"}
              </button>
            ))}
          </div>
        </div>
        <BarChart key={chartTab} data={chartData} maxVal={maxMinutes} />
      </div>

      {/* 과목별 도넛차트 */}
      <div className="glass-card slide-in-up stagger-4">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--secondary-color)" }}>pie_chart</span>
          과목별 학습 비율
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", justifyContent: "center" }}>
          {/* SVG 도넛 */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <DonutChart segments={donutSegments} size={110} thickness={18} />
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center", pointerEvents: "none"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-primary)" }}>{studyTotal}m</div>
              <div style={{ fontSize: "9px", color: "var(--text-disabled)" }}>총 학습</div>
            </div>
          </div>

          {/* 범례 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {donutSegments.filter(s => s.label).map((seg, i) => {
              const pct = studyTotal > 0 ? Math.round((seg.value / studyTotal) * 100) : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", fontWeight: "700", flex: 1 }}>{seg.label}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>{pct}%</span>
                </div>
              );
            })}
            {studyTotal === 0 && (
              <p style={{ fontSize: "12px", color: "var(--text-disabled)", textAlign: "center" }}>아직 학습 기록 없음</p>
            )}
          </div>
        </div>
      </div>

      {/* 과목별 Top 3 */}
      <div className="glass-card slide-in-up stagger-4">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--accent-color)" }}>menu_book</span>
          집중 과목 Top 3
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sortedSubjects.map(([subName, mins], idx) => {
            const percent = safeStats.totalStudyMinutes
              ? Math.min(100, Math.round((mins / safeStats.totalStudyMinutes) * 100)) : 0;
            const medals = ["🥇", "🥈", "🥉"];
            const color = subjectColors[subName] || "var(--sub-etc)";
            return (
              <div key={subName} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{medals[idx]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    <span>{subName}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{mins}분 · {percent}%</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--surface-container-high)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: mounted ? `${percent}%` : "0%",
                      backgroundColor: color,
                      borderRadius: "999px",
                      transition: `width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${0.4 + idx * 0.15}s`,
                      boxShadow: `0 0 6px ${color}60`
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
          {sortedSubjects.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--text-disabled)", fontSize: "12px" }}>아직 기록된 과목별 학습이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 휴식 유형 분포 */}
      <div className="glass-card slide-in-up stagger-5">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--accent-color)" }}>local_cafe</span>
          휴식 유형별 비율
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.entries(safeRestMinutes).map(([type, mins], i) => {
            const percent = Math.min(100, Math.round((mins / totalRestMinutes) * 100));
            const restColors = { "식사": "#FF8A65", "휴식": "#4FC3F7", "수면": "#BA68C8", "기타": "#AED581" };
            return (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: "700", width: "36px", fontSize: "12px" }}>{type}</span>
                <div style={{ flex: 1, height: "8px", background: "var(--surface-container-high)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: mounted ? `${percent}%` : "0%",
                    backgroundColor: restColors[type] || "var(--accent-color)",
                    borderRadius: "999px",
                    transition: `width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${0.5 + i * 0.12}s`
                  }} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", width: "60px", textAlign: "right" }}>{mins}m ({percent}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 업적 그리드 */}
      <div className="glass-card slide-in-up stagger-6">
        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
          <span className="material-symbols-outlined material-filled" style={{ fontSize: "18px", color: "var(--accent-color)" }}>auto_awesome</span>
          학습 업적 달성 현황
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          {achievements.map((ach, i) => (
            <div
              key={ach.id}
              className={ach.condition ? "achieve-unlocked slide-in-up" : "slide-in-up"}
              style={{
                border: `1.5px solid ${ach.condition ? "var(--secondary-color)" : "var(--border-color)"}`,
                borderRadius: "14px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                backgroundColor: ach.condition ? "rgba(0, 107, 92, 0.06)" : "transparent",
                opacity: ach.condition ? 1 : 0.55,
                transition: "all 0.3s ease",
                animationDelay: `${0.05 * i}s`,
                position: "relative",
                overflow: "hidden"
              }}
            >
              {ach.condition && (
                <div style={{
                  position: "absolute", top: "6px", right: "6px",
                  width: "16px", height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "var(--secondary-color)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <span className="material-symbols-outlined material-filled" style={{ fontSize: "10px", color: "#fff" }}>check</span>
                </div>
              )}
              <span style={{ fontSize: "18px" }}>{ach.title.split(" ")[0]}</span>
              <h4 style={{ fontSize: "12px", fontWeight: "800", color: ach.condition ? "var(--secondary-color)" : "var(--text-primary)" }}>
                {ach.title.split(" ").slice(1).join(" ")}
              </h4>
              <p style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{ach.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
