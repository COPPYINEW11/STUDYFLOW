import { useState, useEffect } from "react";

export const Group = ({
  stats = {
    totalStudyMinutes: 0,
    longestSessionMinutes: 0,
    joinedGroup: false,
    createdGroup: false,
    completedGroupGoals: 0
  },
  setStats,
  onJoinGroup,
  onCreateGroup
}) => {
  const [invitationCode, setInvitationCode] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 채팅 효과를 위한 상태
  const [activeMemberIdx, setActiveMemberIdx] = useState(null);
  const [chatBubble, setChatBubble] = useState(null);

  const [groupName, setGroupName] = useState("Flow 마스터즈");
  const [maxMembers, setMaxMembers] = useState(5);
  const [groupSubject, setGroupSubject] = useState("수학");
  const [groupCode, setGroupCode] = useState("SF-8927");

  const [mathGoal, setMathGoal] = useState(2);
  const [englishGoal, setEnglishGoal] = useState(2);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const safeStats = stats || {
    totalStudyMinutes: 0, longestSessionMinutes: 0,
    joinedGroup: false, createdGroup: false, completedGroupGoals: 0
  };

  const mockGroupMembers = [
    {
      name: "이도영 (나)", level: Math.max(1, Math.floor(safeStats.totalStudyMinutes / 60) + 1),
      hours: `${Math.floor(safeStats.totalStudyMinutes / 60)}h ${safeStats.totalStudyMinutes % 60}m`,
      progress: Math.min(100, Math.floor((safeStats.totalStudyMinutes / 120) * 100)),
      active: true, avatar: "🧑‍💻", isMe: true, subject: "수학"
    },
    { name: "김지민", level: 8, hours: "3h 40m", progress: 100, active: false, avatar: "👧", isMe: false, subject: "영어" },
    { name: "박성준", level: 5, hours: "1h 15m", progress: 60, active: true, avatar: "👦", isMe: false, subject: "수학" },
    { name: "최수아", level: 12, hours: "0h 45m", progress: 35, active: false, avatar: "🧑‍🎓", isMe: false, subject: "국어" },
    { name: "정민우", level: 3, hours: "2h 10m", progress: 85, active: true, avatar: "🧑", isMe: false, subject: "과학" }
  ];

  const chatMessages = [
    "열공하세요! 💪", "오늘도 화이팅~", "목표 달성 임박!", "잠깐 쉬고 올게요 ☕", "집중하는 중..."
  ];

  const getLevelBadgeColor = (lv) => {
    if (lv >= 30) return "#42A5F5";
    if (lv >= 20) return "#26A69A";
    if (lv >= 10) return "#FFCA28";
    if (lv >= 5)  return "#90A4AE";
    return "#A1887F";
  };

  const getLevelLabel = (lv) => {
    if (lv >= 30) return "다이아";
    if (lv >= 20) return "플래티넘";
    if (lv >= 10) return "골드";
    if (lv >= 5)  return "실버";
    return "브론즈";
  };

  const handleCreateGroupSubmit = () => {
    if (!groupName.trim()) { alert("그룹 이름을 입력해주세요!"); return; }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGroupCode(code);
    onCreateGroup();
    setShowCreateGroupModal(false);
    try { navigator.clipboard.writeText(code); } catch(e) {}
    alert(`🎉 [${groupName}] 스터디 그룹이 성공적으로 개설되었습니다!\n초대 코드: ${code}`);
  };

  const handleJoinCode = () => {
    if (!invitationCode.trim()) { alert("초대 코드를 입력해주세요!"); return; }
    alert(`🎉 그룹 참가 완료! 초대코드 [${invitationCode.toUpperCase()}] 연결 성공!`);
    onJoinGroup();
    setInvitationCode("");
  };

  const handleSaveGoals = () => {
    setShowGoalModal(false);
    if (setStats) {
      setStats(prev => ({ ...prev, completedGroupGoals: prev.completedGroupGoals + 1 }));
    }
    alert(`공동 목표: 수학 ${mathGoal}h, 영어 ${englishGoal}h 설정 완료!\n목표 달성 시 2배 경험치 적용!`);
  };

  const handleMemberClick = (idx) => {
    if (activeMemberIdx === idx) {
      setActiveMemberIdx(null);
      setChatBubble(null);
    } else {
      setActiveMemberIdx(idx);
      const randMsg = chatMessages[Math.floor(Math.random() * chatMessages.length)];
      setChatBubble({ idx, msg: randMsg });
      setTimeout(() => setChatBubble(null), 2500);
    }
  };

  const isGoalReached = safeStats.totalStudyMinutes >= (mathGoal + englishGoal) * 60;
  const goalProgressPct = Math.min(100, Math.floor((safeStats.totalStudyMinutes / ((mathGoal + englishGoal) * 60)) * 100));
  const activeCount = mockGroupMembers.filter(m => m.active).length;

  return (
    <div className="scrollable">

      {/* 미참가 상태 */}
      {!safeStats.joinedGroup ? (
        <div>
          {/* 히어로 카드 */}
          <div
            className="glass-card slide-in-up"
            style={{
              background: "linear-gradient(135deg, #24389c 0%, #006b5c 100%)",
              color: "#ffffff",
              textAlign: "center",
              padding: "28px 20px",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "absolute", top: "-30px", left: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-20px", right: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

            <div style={{ fontSize: "48px", marginBottom: "10px" }}>👥</div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>스터디 그룹 참가하기</h3>
            <p style={{ fontSize: "12px", opacity: 0.85, lineHeight: 1.6, marginBottom: "4px" }}>
              친구들과 함께 공부하고, 실시간으로<br/>목표를 공유해 2배의 경험치를 획득하세요!
            </p>
          </div>

          {/* 초대 코드 입력 */}
          <div className="glass-card slide-in-up stagger-2">
            <h4 style={{ fontSize: "13px", fontWeight: "800", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--primary-color)" }}>key</span>
              초대 코드로 참가
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="input-field"
                placeholder="초대 코드 입력 (6자리)"
                value={invitationCode}
                onChange={e => setInvitationCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleJoinCode()}
              />
              <button className="btn btn-primary" style={{ width: "auto", padding: "10px 16px" }} onClick={handleJoinCode}>
                참가
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="slide-in-up stagger-3" style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-disabled)", fontWeight: "700" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
          </div>

          {/* 그룹 생성 */}
          <div className="glass-card slide-in-up stagger-4">
            <h4 style={{ fontSize: "13px", fontWeight: "800", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--secondary-color)" }}>add_circle</span>
              새 그룹 개설하기
            </h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              나만의 스터디 그룹을 만들고 친구를 초대하세요!
            </p>
            <button className="btn btn-secondary" onClick={() => setShowCreateGroupModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>group_add</span>
              새로운 그룹 만들기
            </button>
          </div>

          {/* 기능 미리보기 */}
          <div className="glass-card slide-in-up stagger-5" style={{ background: "var(--surface-color)" }}>
            <h4 style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "12px" }}>그룹 스터디 혜택</h4>
            {[
              { icon: "bolt", text: "목표 달성 시 경험치 2배!", color: "var(--accent-color)" },
              { icon: "monitoring", text: "멤버 실시간 공부 현황 확인", color: "var(--primary-color)" },
              { icon: "emoji_events", text: "그룹 랭킹 및 업적 시스템", color: "var(--secondary-color)" }
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: i < 2 ? "10px" : "0" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                  background: `${item.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <span className="material-symbols-outlined material-filled" style={{ fontSize: "18px", color: item.color }}>{item.icon}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* 그룹 헤더 */}
          <div
            className="glass-card tier-banner slide-in-up"
            style={{
              background: "linear-gradient(135deg, rgba(36,56,156,0.08) 0%, rgba(0,107,92,0.08) 100%)",
              border: "1.5px solid var(--secondary-color)",
              padding: "16px"
            }}
          >
            {/* 그룹명 + 공유 버튼 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--secondary-color)", letterSpacing: "1px", textTransform: "uppercase" }}>진행 중 · 스터디 그룹</span>
                <h3 style={{ fontSize: "18px", fontWeight: "900", marginTop: "2px", color: "var(--text-primary)" }}>{groupName}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: "700", color: "var(--secondary-color)",
                    background: "rgba(0,107,92,0.1)", padding: "2px 8px", borderRadius: "8px",
                    display: "flex", alignItems: "center", gap: "4px"
                  }}>
                    <span className="live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--secondary-color)", display: "inline-block" }} />
                    {activeCount}명 공부 중
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-disabled)" }}>{mockGroupMembers.length}/{maxMembers}명</span>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: "auto", padding: "8px 12px", fontSize: "11px" }}
                onClick={() => {
                  try { navigator.clipboard.writeText(groupCode); } catch(e) {}
                  alert(`초대 코드가 복사되었습니다: ${groupCode}`);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>share</span>
                {groupCode}
              </button>
            </div>

            {/* 공동 목표 진행률 */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700" }}>
                  🎯 공동 목표: 수학 {mathGoal}h + 영어 {englishGoal}h
                </span>
                <button
                  className="btn btn-primary"
                  style={{ width: "auto", padding: "4px 10px", fontSize: "10px" }}
                  onClick={() => setShowGoalModal(true)}
                >
                  수정
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                <span>진행률</span>
                <span style={{ fontWeight: "800", color: isGoalReached ? "var(--secondary-color)" : "var(--text-primary)" }}>
                  {isGoalReached ? "✅ 달성!" : `${goalProgressPct}%`}
                </span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-container-high)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: mounted ? `${isGoalReached ? 100 : goalProgressPct}%` : "0%",
                  background: isGoalReached
                    ? "linear-gradient(90deg, var(--secondary-color), #00BFA5)"
                    : "linear-gradient(90deg, var(--primary-color), var(--secondary-color))",
                  borderRadius: "999px",
                  transition: "width 1.0s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s",
                  boxShadow: isGoalReached ? "0 0 10px rgba(0,107,92,0.4)" : "none"
                }} />
              </div>

              {isGoalReached && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  color: "var(--secondary-color)", fontSize: "11px", fontWeight: "700", marginTop: "8px"
                }}>
                  <span className="material-symbols-outlined material-filled" style={{ fontSize: "14px" }}>auto_awesome</span>
                  공동 목표 달성 완료! EXP 2배 보너스 적용 중 🎉
                </div>
              )}
            </div>
          </div>

          {/* 멤버 헤더 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800" }}>멤버 실시간 현황</h3>
            <span style={{ fontSize: "11px", color: "var(--text-disabled)" }}>탭하여 메시지 보기</span>
          </div>

          {/* 멤버 카드 리스트 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {mockGroupMembers.map((member, idx) => {
              const badgeColor = getLevelBadgeColor(member.level);
              const tierLabel = getLevelLabel(member.level);
              const isSelected = activeMemberIdx === idx;

              return (
                <div
                  key={member.name}
                  className="member-card-interactive slide-in-up"
                  style={{
                    border: member.isMe
                      ? "2px solid var(--primary-color)"
                      : isSelected
                        ? "1.5px solid var(--secondary-color)"
                        : "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "14px",
                    background: member.isMe
                      ? "linear-gradient(135deg, rgba(36,56,156,0.04) 0%, rgba(0,107,92,0.04) 100%)"
                      : isSelected
                        ? "rgba(0,107,92,0.03)"
                        : "var(--surface-color)",
                    cursor: "pointer",
                    boxShadow: member.active ? "0 2px 10px rgba(36,56,156,0.08)" : "none",
                    animationDelay: `${idx * 0.06}s`,
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                  onClick={() => handleMemberClick(idx)}
                >
                  {/* 채팅 말풍선 */}
                  {chatBubble && chatBubble.idx === idx && (
                    <div style={{
                      position: "absolute",
                      top: "-34px",
                      left: "60px",
                      background: "var(--text-primary)",
                      color: "var(--bg-color)",
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      animation: "slideInUp 0.2s ease both"
                    }}>
                      {chatBubble.msg}
                      <div style={{
                        position: "absolute", bottom: "-6px", left: "14px",
                        width: 0, height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderTop: "6px solid var(--text-primary)"
                      }} />
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* 아바타 + 활성 표시 */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "50%",
                        background: member.active
                          ? "linear-gradient(135deg, var(--primary-color), var(--secondary-color))"
                          : "var(--surface-container-high)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px",
                        boxShadow: member.active ? "0 3px 10px rgba(36,56,156,0.3)" : "none"
                      }}>
                        {member.avatar}
                      </div>
                      {/* 온라인 표시 */}
                      <div
                        className={member.active ? "active-pulse-dot" : ""}
                        style={{
                          position: "absolute", bottom: "1px", right: "1px",
                          width: "10px", height: "10px", borderRadius: "50%",
                          backgroundColor: member.active ? "var(--secondary-color)" : "var(--text-disabled)",
                          border: "2px solid var(--surface-color)"
                        }}
                      />
                    </div>

                    {/* 이름 + 레벨 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-primary)" }}>
                          {member.name}
                        </span>
                        {member.isMe && (
                          <span style={{
                            fontSize: "9px", fontWeight: "800",
                            color: "var(--primary-color)",
                            background: "rgba(36,56,156,0.1)",
                            padding: "1px 5px", borderRadius: "4px"
                          }}>나</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {/* 레벨 배지 */}
                        <span style={{
                          fontSize: "10px", fontWeight: "800",
                          color: badgeColor,
                          background: `${badgeColor}18`,
                          padding: "1px 8px", borderRadius: "8px",
                          border: `1px solid ${badgeColor}44`
                        }}>Lv.{member.level} {tierLabel}</span>
                        {/* 과목 배지 */}
                        <span style={{
                          fontSize: "10px", fontWeight: "700",
                          color: "var(--text-secondary)",
                          background: "var(--surface-container)",
                          padding: "1px 6px", borderRadius: "6px"
                        }}>{member.subject}</span>
                      </div>
                    </div>

                    {/* 공부 시간 */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: "800", color: member.active ? "var(--primary-color)" : "var(--text-disabled)" }}>
                        {member.hours}
                      </div>
                      <div style={{ fontSize: "9px", color: member.active ? "var(--secondary-color)" : "var(--text-disabled)", fontWeight: "700" }}>
                        {member.active ? "공부 중 📖" : "자리 비움"}
                      </div>
                    </div>
                  </div>

                  {/* 진행률 바 */}
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-disabled)", marginBottom: "4px" }}>
                      <span>오늘 목표 달성도</span>
                      <span style={{ fontWeight: "800", color: member.progress >= 100 ? "var(--secondary-color)" : "var(--text-secondary)" }}>
                        {member.progress >= 100 ? "✅ 달성!" : `${member.progress}%`}
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "var(--surface-container-high)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: mounted ? `${member.progress}%` : "0%",
                        background: member.active
                          ? "linear-gradient(90deg, var(--secondary-color), #00BFA5)"
                          : "linear-gradient(90deg, #90A4AE, #B0BEC5)",
                        borderRadius: "999px",
                        transition: `width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${0.3 + idx * 0.1}s`,
                        boxShadow: member.active && member.progress > 0 ? "0 0 6px rgba(0,107,92,0.4)" : "none"
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 그룹 탈퇴 */}
          <div style={{ marginTop: "16px" }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: "12px", color: "var(--error-color)", borderColor: "var(--error-color)" }}
              onClick={() => {
                if (window.confirm("그룹에서 탈퇴하시겠습니까?")) {
                  if (setStats) setStats(prev => ({ ...prev, joinedGroup: false, createdGroup: false }));
                }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>exit_to_app</span>
              그룹 탈퇴
            </button>
          </div>
        </div>
      )}

      {/* 목표 설정 모달 */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>🎯 그룹 목표 설정</h3>
              <span className="material-symbols-outlined" onClick={() => setShowGoalModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>공동 수학 목표 (시간)</label>
                <input type="number" className="input-field" value={mathGoal}
                  onChange={e => setMathGoal(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>공동 영어 목표 (시간)</label>
                <input type="number" className="input-field" value={englishGoal}
                  onChange={e => setEnglishGoal(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ marginTop: "4px" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setShowGoalModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleSaveGoals}>저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 생성 모달 */}
      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>🆕 새 스터디 그룹 개설</h3>
              <span className="material-symbols-outlined" onClick={() => setShowCreateGroupModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>그룹 이름</label>
                <input type="text" className="input-field" value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="예: Flow 마스터즈" style={{ marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>카테고리 / 과목</label>
                <select className="input-field" value={groupSubject}
                  onChange={e => setGroupSubject(e.target.value)}
                  style={{ marginTop: "4px", padding: "10px" }}>
                  <option value="수학">수학</option>
                  <option value="영어">영어</option>
                  <option value="국어">국어</option>
                  <option value="과학">과학</option>
                  <option value="자율학습">자율학습</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>최대 인원</label>
                <input type="number" className="input-field" value={maxMembers}
                  onChange={e => setMaxMembers(Math.max(2, parseInt(e.target.value) || 2))}
                  style={{ marginTop: "4px" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateGroupModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleCreateGroupSubmit}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>group_add</span>
                그룹 생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
