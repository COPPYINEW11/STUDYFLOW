import { useState } from "react";

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
  
  // Modals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Group Details
  const [groupName, setGroupName] = useState("Flow 마스터즈");
  const [maxMembers, setMaxMembers] = useState(5);
  const [groupSubject, setGroupSubject] = useState("수학");
  const [groupCode, setGroupCode] = useState("SF-8927");

  const [mathGoal, setMathGoal] = useState(2); // Hours
  const [englishGoal, setEnglishGoal] = useState(2); // Hours

  const safeStats = stats || {
    totalStudyMinutes: 0,
    longestSessionMinutes: 0,
    joinedGroup: false,
    createdGroup: false,
    completedGroupGoals: 0
  };

  const mockGroupMembers = [
    { name: "이도영 (나)", hours: Math.floor(safeStats.totalStudyMinutes / 60) + "h " + (safeStats.totalStudyMinutes % 60) + "m", progress: Math.min(100, Math.floor((safeStats.totalStudyMinutes / 120) * 100)), active: true },
    { name: "김지민", hours: "3h 40m", progress: 100, active: false },
    { name: "박성준", hours: "1h 15m", progress: 60, active: true },
    { name: "최수아", hours: "0h 45m", progress: 35, active: false },
    { name: "정민우", hours: "2h 10m", progress: 85, active: true }
  ];

  const handleCreateGroupSubmit = () => {
    if (!groupName.trim()) {
      alert("그룹 이름을 입력해주세요!");
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGroupCode(code);
    onCreateGroup();
    setShowCreateGroupModal(false);
    navigator.clipboard.writeText(code);
    alert(`🎉 [${groupName}] 스터디 그룹이 성공적으로 개설되었습니다!\n초대 코드: ${code}\n초대 코드가 클립보드에 자동 복사되었습니다. 친구에게 공유해 보세요!`);
  };

  const handleJoinCode = () => {
    if (!invitationCode.trim()) {
      alert("초대 코드를 입력해주세요!");
      return;
    }
    alert(`🎉 그룹 참가 완료! 초대코드 [${invitationCode.toUpperCase()}] 에 정상 연결되었습니다!`);
    onJoinGroup();
    setInvitationCode("");
  };

  const handleSaveGoals = () => {
    setShowGoalModal(false);
    if (setStats) {
      setStats(prev => ({
        ...prev,
        completedGroupGoals: prev.completedGroupGoals + 1
      }));
    }
    alert(`공동 목표 설정 완료:\n수학: ${mathGoal}시간, 영어: ${englishGoal}시간\n목표 달성 시 공부한 시간당 2배의 경험치가 적용됩니다!`);
  };

  const isGoalReached = safeStats.totalStudyMinutes >= (mathGoal + englishGoal) * 60;

  return (
    <div className="scrollable">
      {/* Group Join Invitation Card */}
      {!safeStats.joinedGroup ? (
        <div className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", color: "var(--primary-color)" }}>
            <span className="material-symbols-outlined text-[48px]">group</span>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "8px" }}>스터디 그룹 참가하기</h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "20px" }}>
            초대 코드를 주고받아 실시간으로 공부 시간을 공유하고 공동 목표를 설정하세요.
          </p>

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input
              type="text"
              className="input-field"
              placeholder="초대 코드 입력 (6자리)"
              value={invitationCode}
              onChange={e => setInvitationCode(e.target.value)}
            />
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleJoinCode}>
              참가
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-disabled)" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
          </div>

          <button className="btn btn-secondary" style={{ marginTop: "16px" }} onClick={() => setShowCreateGroupModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>code</span>
            새로운 그룹 만들기 (개설하기)
          </button>
        </div>
      ) : (
        <div>
          {/* Active Group Info */}
          <div className="glass-card" style={{ background: "linear-gradient(135deg, rgba(0,107,92,0.05) 0%, rgba(36,56,156,0.05) 100%)", border: "1px solid var(--secondary-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--secondary-color)" }}>진행 중인 스터디 그룹</span>
                <h3 style={{ fontSize: "16px", fontWeight: "800", marginTop: "2px" }}>{groupName} ({mockGroupMembers.length}/{maxMembers})</h3>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: "auto", padding: "6px 12px", fontSize: "11px" }}
                onClick={() => {
                  navigator.clipboard.writeText(groupCode);
                  alert(`초대 코드가 복사되었습니다: ${groupCode}`);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>share</span>
                초대 코드: {groupCode}
              </button>
            </div>

            {/* Joint Goal Box */}
            <div style={{ marginTop: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700" }}>공동 목표: 수학 {mathGoal}h, 영어 {englishGoal}h</span>
                <button
                  className="btn btn-primary"
                  style={{ width: "auto", padding: "4px 8px", fontSize: "10px" }}
                  onClick={() => setShowGoalModal(true)}
                >
                  목표 조정
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                <span>목표 달성률</span>
                <span>{isGoalReached ? "100%" : `${Math.floor((safeStats.totalStudyMinutes / ((mathGoal + englishGoal) * 60)) * 100)}%`}</span>
              </div>
              
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${isGoalReached ? 100 : Math.min(100, Math.floor((safeStats.totalStudyMinutes / ((mathGoal + englishGoal) * 60)) * 100))}%`,
                    backgroundColor: "var(--secondary-color)"
                  }}
                />
              </div>

              {isGoalReached && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--secondary-color)", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>
                  <span className="material-symbols-outlined material-filled" style={{ fontSize: "14px" }}>auto_awesome</span>
                  <span>공동 목표 달성 완료! 5분당 100EXP 획득 적용 중 (2배 혜택)</span>
                </div>
              )}
            </div>
          </div>

          {/* Members list */}
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>멤버 실시간 공부 현황 (과목: {groupSubject})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {mockGroupMembers.map(member => (
              <div key={member.name} className="group-member-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700" }}>{member.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: member.active ? "var(--secondary-color)" : "var(--text-disabled)"
                    }} />
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      {member.active ? "공부 중" : "자리 비움"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  <span>목표 달성도</span>
                  <span>{member.hours}</span>
                </div>
                <div className="progress-bar-track" style={{ height: "6px" }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${member.progress}%`,
                      backgroundColor: member.active ? "var(--secondary-color)" : "var(--primary-color)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Setter Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>그룹 목표 설정</h3>
              <span className="material-symbols-outlined" onClick={() => setShowGoalModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>공동 수학 목표 (시간)</label>
                <input
                  type="number"
                  className="input-field"
                  value={mathGoal}
                  onChange={e => setMathGoal(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ marginTop: "4px" }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>공동 영어 목표 (시간)</label>
                <input
                  type="number"
                  className="input-field"
                  value={englishGoal}
                  onChange={e => setEnglishGoal(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ marginTop: "4px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setShowGoalModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleSaveGoals}>저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>새로운 스터디 그룹 개설</h3>
              <span className="material-symbols-outlined" onClick={() => setShowCreateGroupModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>그룹 이름</label>
                <input
                  type="text"
                  className="input-field"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="예: Flow 마스터즈"
                  style={{ marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>카테고리 / 과목</label>
                <select
                  className="input-field"
                  value={groupSubject}
                  onChange={e => setGroupSubject(e.target.value)}
                  style={{ marginTop: "4px", padding: "10px" }}
                >
                  <option value="수학">수학</option>
                  <option value="영어">영어</option>
                  <option value="국어">국어</option>
                  <option value="과학">과학</option>
                  <option value="자율학습">자율학습</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>최대 인원</label>
                <input
                  type="number"
                  className="input-field"
                  value={maxMembers}
                  onChange={e => setMaxMembers(Math.max(2, parseInt(e.target.value) || 2))}
                  style={{ marginTop: "4px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateGroupModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleCreateGroupSubmit}>그룹 생성하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
