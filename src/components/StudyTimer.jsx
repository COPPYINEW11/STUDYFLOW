import { useState, useEffect, useRef } from "react";

export const StudyTimer = ({
  activeSubject,
  timerMode,
  setTimerMode,
  onSaveStudySession,
  settings = { darkMode: false, allowSpecificApps: false, flipToFocus: false, notificationType: "sound" }
}) => {
  const safeSettings = settings || {
    darkMode: false,
    allowSpecificApps: false,
    flipToFocus: false,
    notificationType: "sound"
  };

  // Timer States
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 min default
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // For stopwatch
  const [pomodoroWorkTime, setPomodoroWorkTime] = useState(25); // Minutes
  const [pomodoroRestTime, setPomodoroRestTime] = useState(5); // Minutes
  const [customTimerTime, setCustomTimerTime] = useState(60); // Minutes default for normal Timer
  const [isResting, setIsResting] = useState(false); // In pomodoro break cycle

  // Flip State (For flip-to-focus feature)
  const [isPhoneFlipped, setIsPhoneFlipped] = useState(false);

  // Modals
  const [showTimeEditModal, setShowTimeEditModal] = useState(false);
  const [showRestTypeModal, setShowRestTypeModal] = useState(false);
  const [customRestType, setCustomRestType] = useState("");

  const timerRef = useRef(null);

  // HOISTED FUNCTIONS DEFINED AT TOP TO PREVENT TDZ (Temporal Dead Zone)
  function playNotification() {
    if (safeSettings.notificationType === "vibrate" || safeSettings.notificationType === "both") {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    if (safeSettings.notificationType === "sound" || safeSettings.notificationType === "both") {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.warn("Audio Context failed to load", e);
      }
    }
  }

  function handleTimerFinished() {
    setIsActive(false);
    playNotification();
    setShowRestTypeModal(true);
  }

  function resetTimer() {
    setIsActive(false);
    setIsPaused(false);
    setIsResting(false);
    setElapsedSeconds(0);

    if (timerMode === "pomodoro") {
      setSecondsLeft(pomodoroWorkTime * 60);
    } else if (timerMode === "timer") {
      setSecondsLeft(customTimerTime * 60);
    } else {
      setSecondsLeft(0);
    }
  }

  // Sync mode changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerMode]);

  // Handle custom DevTools time adjustment event
  useEffect(() => {
    const handleAdjust = (e) => {
      const amount = e.detail; // seconds
      if (timerMode === "stopwatch") {
        setElapsedSeconds(prev => Math.max(0, prev + amount));
      } else {
        setSecondsLeft(prev => Math.max(0, prev + amount));
      }
    };
    window.addEventListener("adjust-timer-time", handleAdjust);
    return () => window.removeEventListener("adjust-timer-time", handleAdjust);
  }, [timerMode]);

  // Handle custom AI set duration and auto start event
  useEffect(() => {
    const handleSetDuration = (e) => {
      const { mode, minutes, autoStart } = e.detail;
      if (mode === "pomodoro") {
        setPomodoroWorkTime(minutes);
        setSecondsLeft(minutes * 60);
      } else if (mode === "timer") {
        setCustomTimerTime(minutes);
        setSecondsLeft(minutes * 60);
      } else if (mode === "stopwatch") {
        setElapsedSeconds(0);
      }

      if (autoStart) {
        setIsActive(true);
        setIsPaused(false);
      }
    };
    window.addEventListener("set-timer-duration", handleSetDuration);
    return () => window.removeEventListener("set-timer-duration", handleSetDuration);
  }, []);

  // Handle device orientation for real flipping (Face down detection)
  useEffect(() => {
    const handleOrientation = (event) => {
      const { beta, gamma } = event;
      if (beta !== null && gamma !== null) {
        const isFaceDown = Math.abs(beta) > 165;
        setIsPhoneFlipped(isFaceDown);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // Timer Tick Loop
  useEffect(() => {
    if (isActive && !isPaused) {
      const requiresFlip = safeSettings.flipToFocus;
      const canTick = !requiresFlip || isPhoneFlipped;

      if (canTick) {
        timerRef.current = setInterval(() => {
          if (timerMode === "stopwatch") {
            setElapsedSeconds(prev => prev + 1);
          } else {
            setSecondsLeft(prev => {
              if (prev <= 1) {
                handleTimerFinished();
                return 0;
              }
              return prev - 1;
            });
          }
        }, 1000);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPaused, isPhoneFlipped, safeSettings.flipToFocus, timerMode]);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    if (!isResting && timerMode !== "stopwatch") {
      setShowRestTypeModal(true);
    }
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const stopTimer = () => {
    if (window.confirm("공부를 정지하시겠습니까? 현재까지의 공부 시간이 저장됩니다.")) {
      const totalTimeLimit = timerMode === "pomodoro" ? (isResting ? pomodoroRestTime : pomodoroWorkTime) : customTimerTime;
      const studiedMinutes = timerMode === "stopwatch"
        ? Math.floor(elapsedSeconds / 60)
        : Math.floor((totalTimeLimit * 60 - secondsLeft) / 60);

      if (studiedMinutes > 0) {
        onSaveStudySession(activeSubject || "자율학습", studiedMinutes, isResting ? "휴식" : "공부");
      }
      resetTimer();
    }
  };

  const handleRestSelect = (type) => {
    const totalTimeLimit = timerMode === "pomodoro" ? (isResting ? pomodoroRestTime : pomodoroWorkTime) : customTimerTime;
    const studiedMinutes = timerMode === "stopwatch"
      ? Math.floor(elapsedSeconds / 60)
      : Math.floor((totalTimeLimit * 60 - secondsLeft) / 60);

    if (studiedMinutes > 0) {
      onSaveStudySession(activeSubject || "자율학습", studiedMinutes, type);
    }

    setShowRestTypeModal(false);

    if (timerMode === "pomodoro") {
      if (!isResting) {
        setIsResting(true);
        setSecondsLeft(pomodoroRestTime * 60);
        setIsActive(true);
        setIsPaused(false);
      } else {
        setIsResting(false);
        setSecondsLeft(pomodoroWorkTime * 60);
        setIsActive(false);
        setIsPaused(false);
      }
    } else {
      resetTimer();
    }
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const getDisplayTime = () => {
    if (timerMode === "stopwatch") {
      return formatTime(elapsedSeconds);
    }
    return formatTime(secondsLeft);
  };

  const handleSaveCustomTimes = (work, rest, timerVal) => {
    setPomodoroWorkTime(work);
    setPomodoroRestTime(rest);
    setCustomTimerTime(timerVal);

    if (timerMode === "pomodoro") {
      setSecondsLeft(work * 60);
    } else if (timerMode === "timer") {
      setSecondsLeft(timerVal * 60);
    }
    setShowTimeEditModal(false);
  };

  // Progress Calculations for circular ring
  const totalLimitForRing = timerMode === "pomodoro" 
    ? (isResting ? pomodoroRestTime : pomodoroWorkTime) * 60 
    : customTimerTime * 60;
  
  const progressPercent = timerMode === "stopwatch"
    ? 1.0
    : totalLimitForRing > 0 ? (secondsLeft / totalLimitForRing) : 1.0;

  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent * circumference);

  return (
    <div className={`scrollable ${isActive && !isPaused ? "focus-immersive" : ""}`} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      height: "100%",
      paddingBottom: "80px",
      transition: "background 0.5s ease"
    }}>
      {/* Immersive mode styles */}
      {isActive && !isPaused && (
        <style>{`
          .bottom-nav { transform: translateY(100%) !important; }
          .app-header { display: none !important; }
        `}</style>
      )}

      {/* Header Info */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary-color)" }}>
          {isResting ? "☕️ 휴식 시간" : `✍️ ${activeSubject || "자율학습"}`}
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
          {timerMode.toUpperCase()} {isResting ? "(휴식)" : "(집중)"}
        </p>
      </div>

      {/* Mode Switches */}
      {!isActive && (
        <div className="segmented-control" style={{ width: "90%", maxWidth: "320px", marginTop: "12px" }}>
          <button
            className={`segment-btn ${timerMode === "pomodoro" ? "active" : ""}`}
            onClick={() => setTimerMode("pomodoro")}
          >
            뽀모도로
          </button>
          <button
            className={`segment-btn ${timerMode === "timer" ? "active" : ""}`}
            onClick={() => setTimerMode("timer")}
          >
            타이머
          </button>
          <button
            className={`segment-btn ${timerMode === "stopwatch" ? "active" : ""}`}
            onClick={() => setTimerMode("stopwatch")}
          >
            스톱워치
          </button>
        </div>
      )}

      {/* Flip Phone Simulated 3D Mockup */}
      {isActive && !isPaused && safeSettings.flipToFocus && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          margin: "12px 0",
          width: "100%"
        }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "700",
            color: isPhoneFlipped ? "var(--secondary-color)" : "var(--accent-color)",
            textAlign: "center"
          }}>
            {isPhoneFlipped 
              ? "📱 휴대폰이 뒤집혔습니다. 타이머 작동 중!" 
              : "🤳 휴대폰을 뒤집어 놓으세요 (스마트폰 클릭하여 시뮬레이션)"}
          </span>
          
          <div 
            onClick={() => setIsPhoneFlipped(!isPhoneFlipped)}
            style={{
              width: "80px",
              height: "130px",
              perspective: "600px",
              cursor: "pointer",
              margin: "6px auto"
            }}
          >
            <div 
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transformStyle: "preserve-3d",
                transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
                transform: isPhoneFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
            >
              {/* Phone Front */}
              <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                backgroundColor: "#222222",
                borderRadius: "12px",
                border: "2px solid #333333",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px",
                boxShadow: "0 6px 12px rgba(0,0,0,0.3)"
              }}>
                <div style={{ width: "24px", height: "3px", backgroundColor: "#111", borderRadius: "2.5px" }} />
                <div style={{
                  flex: 1,
                  width: "100%",
                  backgroundColor: "#050505",
                  borderRadius: "5px",
                  margin: "4px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "600"
                }}>
                  FCAID
                </div>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1px solid #111" }} />
              </div>

              {/* Phone Back */}
              <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                backgroundColor: "var(--primary-color)",
                borderRadius: "12px",
                border: "2px solid #333333",
                transform: "rotateY(180deg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 6px 12px rgba(0,0,0,0.3)"
              }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <span className="material-symbols-outlined text-[14px] material-filled">auto_awesome</span>
                </div>
                <span style={{ fontSize: "8px", fontWeight: "700", marginTop: "6px" }}>FCAID Back</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SVG Circular Timer Face */}
      <div className="timer-face-container">
        <div className={`timer-ring ${isActive && !isPaused ? "timer-pulse-active" : ""}`} style={{
          width: "220px",
          height: "220px",
          position: "relative",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-color)"
        }}>
          <svg 
            viewBox="0 0 220 220"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform: "rotate(-90deg)"
            }}
          >
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="var(--surface-container)"
              strokeWidth="5"
              fill="transparent"
            />
            {timerMode !== "stopwatch" && (
              <circle
                cx="110"
                cy="110"
                r={radius}
                stroke={isResting ? "var(--secondary-color)" : "var(--primary-color)"}
                strokeWidth="5"
                fill="transparent"
                strokeLinecap="round"
                style={{ 
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: "stroke-dashoffset 1s linear" 
                }}
              />
            )}
          </svg>

          <div
            className="timer-digits"
            onClick={() => !isActive && setShowTimeEditModal(true)}
            style={{ 
              position: "relative", 
              zIndex: 10, 
              cursor: !isActive ? "pointer" : "default",
              fontSize: getDisplayTime().length > 5 ? "32px" : "44px"
            }}
          >
            {getDisplayTime()}
          </div>
        </div>
        {!isActive && (
          <p style={{ fontSize: "11px", color: "var(--text-disabled)", marginTop: "8px", cursor: "pointer" }} onClick={() => setShowTimeEditModal(true)}>
            시계를 클릭하여 시간 편집
          </p>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: "16px", width: "90%", maxWidth: "340px", marginBottom: "20px" }}>
        {!isActive ? (
          <button className="btn btn-primary" onClick={startTimer}>
            <span className="material-symbols-outlined material-filled" style={{ color: "#ffffff" }}>play_arrow</span>
            시작
          </button>
        ) : (
          <>
            {isPaused ? (
              <button className="btn btn-primary" onClick={resumeTimer}>
                <span className="material-symbols-outlined material-filled" style={{ color: "#ffffff" }}>play_arrow</span>
                계속
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={pauseTimer}>
                <span className="material-symbols-outlined">pause</span>
                일시정지
              </button>
            )}
            <button className="btn btn-accent" onClick={stopTimer} style={{ backgroundColor: "var(--error-color)" }}>
              <span className="material-symbols-outlined material-filled" style={{ color: "#ffffff" }}>stop</span>
              종료
            </button>
          </>
        )}
      </div>

      {/* Modal: Adjust Time */}
      {showTimeEditModal && (
        <div className="modal-overlay" onClick={() => setShowTimeEditModal(false)}>
          <TimeSettingModal
            timerMode={timerMode}
            pomodoroWorkTime={pomodoroWorkTime}
            pomodoroRestTime={pomodoroRestTime}
            customTimerTime={customTimerTime}
            onClose={() => setShowTimeEditModal(false)}
            onSave={handleSaveCustomTimes}
          />
        </div>
      )}

      {/* Modal: Rest Type Log */}
      {showRestTypeModal && (
        <div className="modal-overlay" onClick={() => setShowRestTypeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined text-primary">local_cafe</span>
                어떤 휴식을 하시겠습니까?
              </h3>
              <span className="material-symbols-outlined" onClick={() => setShowRestTypeModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              선택한 휴식 유형과 시간이 분석 통계에 자동 기록됩니다.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
              <button className="btn btn-secondary" style={{ flexDirection: "column", gap: "4px" }} onClick={() => handleRestSelect("식사")}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>restaurant</span>
                <span>식사</span>
              </button>
              <button className="btn btn-secondary" style={{ flexDirection: "column", gap: "4px" }} onClick={() => handleRestSelect("휴식")}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>local_cafe</span>
                <span>휴식</span>
              </button>
              <button className="btn btn-secondary" style={{ flexDirection: "column", gap: "4px" }} onClick={() => handleRestSelect("수면")}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>bedtime</span>
                <span>수면</span>
              </button>
              <button className="btn btn-secondary" style={{ flexDirection: "column", gap: "4px" }} onClick={() => handleRestSelect("기타")}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>help</span>
                <span>기타</span>
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                className="input-field"
                placeholder="직접 입력 (예: 스트레칭)"
                value={customRestType}
                onChange={e => setCustomRestType(e.target.value)}
              />
              <button
                className="btn btn-primary"
                style={{ width: "auto" }}
                onClick={() => handleRestSelect(customRestType || "기타")}
              >
                입력
              </button>
            </div>
            
            <button className="btn btn-secondary" onClick={() => setShowRestTypeModal(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent for Time Settings inside Modal
const TimeSettingModal = ({ timerMode, pomodoroWorkTime, pomodoroRestTime, customTimerTime, onClose, onSave }) => {
  const [work, setWork] = useState(pomodoroWorkTime);
  const [rest, setRest] = useState(pomodoroRestTime);
  const [timerVal, setTimerVal] = useState(customTimerTime);

  return (
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800" }}>학습 시간 설정</h3>
        <span className="material-symbols-outlined" onClick={onClose} style={{ cursor: "pointer" }}>close</span>
      </div>

      {timerMode === "pomodoro" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>집중 시간 (분)</label>
            <input
              type="number"
              className="input-field"
              value={work}
              onChange={e => setWork(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ marginTop: "4px" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>휴식 시간 (분)</label>
            <input
              type="number"
              className="input-field"
              value={rest}
              onChange={e => setRest(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ marginTop: "4px" }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>타이머 시간 설정 (분)</label>
            <input
              type="number"
              className="input-field"
              value={timerVal}
              onChange={e => setTimerVal(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ marginTop: "4px" }}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button className="btn btn-secondary" onClick={onClose}>취소</button>
        <button className="btn btn-primary" onClick={() => onSave(work, rest, timerVal)}>저장</button>
      </div>
    </div>
  );
};
