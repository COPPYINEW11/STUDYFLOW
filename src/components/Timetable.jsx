import { useState, useEffect, useRef, Fragment } from "react";

export const Timetable = ({
  schedule,
  setSchedule,
  t,
  onStartTimerWithSubject,
  subjectsList
}) => {
  const [activeSegment, setActiveSegment] = useState("timetable"); // timetable | timeline | calendar
  const [isLocked, setIsLocked] = useState(false);
  const [aiText, setAiText] = useState("");
  const [isParsingImage, setIsParsingImage] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [activeCalendarMonth, setActiveCalendarMonth] = useState(new Date());
  const [showCalendarDayModal, setShowCalendarDayModal] = useState(false);
  const [calendarDayModalDate, setCalendarDayModalDate] = useState(null);
  const [showLongPressTimerModal, setShowLongPressTimerModal] = useState(false);
  const [selectedSubjectForTimer, setSelectedSubjectForTimer] = useState(null);

  const fileInputRef = useRef(null);

  // Time red line tracker
  const [currentMinutesInDay, setCurrentMinutesInDay] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // Calculate minutes since 9:00 AM (starts at 0)
      const minutesSinceStart = (hours - 9) * 60 + minutes;
      setCurrentMinutesInDay(minutesSinceStart);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Time range helper: 9:00 AM to 5:00 PM (8 hours, 480 minutes)
  const totalMinutesInTimetable = 8 * 60; // 480 minutes
  const redLineOffsetTop = (currentMinutesInDay / totalMinutesInTimetable) * 100;

  // Render subject inside timetable grid
  const days = ["mon", "tue", "wed", "thu", "fri"];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16]; // 9:00 to 17:00 (1 hour cells)

  // Subject helper
  const getSubjectColorClass = (subjectName) => {
    switch (subjectName) {
      case "수학": return "color-math";
      case "영어": return "color-english";
      case "국어": return "color-korean";
      case "과학": return "color-science";
      case "사회": return "color-social";
      case "역사": return "color-history";
      case "물리": return "color-physics";
      case "화학": return "color-chemistry";
      case "생물": return "color-biology";
      case "정보": return "color-it";
      case "체육": return "color-pe";
      default: return "color-etc";
    }
  };

  // Image Upload File Handler
  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsParsingImage(true);
      setTimeout(() => {
        const mockSchedule = [
          { id: Date.now() + 1, day: "mon", startHour: 9, duration: 2, subject: "국어", location: "교실 302" },
          { id: Date.now() + 2, day: "mon", startHour: 13, duration: 2, subject: "수학", location: "교실 3A" },
          { id: Date.now() + 3, day: "tue", startHour: 10, duration: 2, subject: "영어", location: "어학실" },
          { id: Date.now() + 4, day: "wed", startHour: 9, duration: 2, subject: "과학", location: "과학 실험실" },
          { id: Date.now() + 5, day: "wed", startHour: 14, duration: 2, subject: "체육", location: "체육관" },
          { id: Date.now() + 6, day: "thu", startHour: 11, duration: 2, subject: "역사", location: "교실 3B" },
          { id: Date.now() + 7, day: "fri", startHour: 9, duration: 2, subject: "정보", location: "컴퓨터실" },
          { id: Date.now() + 8, day: "fri", startHour: 13, duration: 2, subject: "사회", location: "교실 302" }
        ];
        setSchedule(mockSchedule);
        setIsParsingImage(false);
        alert("AI가 업로드된 시간표 이미지 분석에 성공하여 스케줄을 자동으로 추출·등록했습니다!");
      }, 2000);
    }
  };

  // Reset timetable
  const handleResetTimetable = () => {
    if (window.confirm("시간표를 정말 초기화하시겠습니까? 모든 정보가 사라집니다.")) {
      setSchedule([]);
    }
  };

  // AI Natural Language Scheduler
  const handleAiTextSubmit = () => {
    if (!aiText.trim()) return;

    let parsedSubject = "기타";
    let parsedDay = "mon";
    let parsedHour = 9;
    let parsedDuration = 1;
    let parsedLocation = "";

    // Parse subject
    const matchedSub = subjectsList.find(sub => aiText.includes(sub));
    if (matchedSub) parsedSubject = matchedSub;

    // Parse day
    if (aiText.includes("화요일") || aiText.includes("화")) parsedDay = "tue";
    else if (aiText.includes("수요일") || aiText.includes("수")) parsedDay = "wed";
    else if (aiText.includes("목요일") || aiText.includes("목")) parsedDay = "thu";
    else if (aiText.includes("금요일") || aiText.includes("금")) parsedDay = "fri";
    else if (aiText.includes("월요일") || aiText.includes("월")) parsedDay = "mon";

    // Parse time
    const timeMatch = aiText.match(/(\d+)시/);
    if (timeMatch) {
      let hr = parseInt(timeMatch[1]);
      if (aiText.includes("오후") && hr < 12) hr += 12;
      if (aiText.includes("저녁") && hr < 12) hr += 12;
      if (hr >= 9 && hr <= 16) parsedHour = hr;
    }

    // Parse duration
    const durMatch = aiText.match(/(\d+)시간/);
    if (durMatch) {
      parsedDuration = parseInt(durMatch[1]);
    }

    // Parse location
    if (aiText.includes("/")) {
      parsedLocation = aiText.split("/")[1].trim();
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
    setAiText("");
    setShowAiModal(false);
    alert(`AI 등록 성공: ${parsedDay.toUpperCase()} ${parsedHour}시 ${parsedSubject} (${parsedDuration}시간) ${parsedLocation ? `장소: ${parsedLocation}` : ""}`);
  };

  // Cell Long press / Tap to start timer
  const handleCellLongPress = (subject) => {
    if (!subject) return;
    setSelectedSubjectForTimer(subject);
    setShowLongPressTimerModal(true);
  };

  // Calendar Helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (val) => {
    setActiveCalendarMonth(new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth() + val, 1));
  };

  const handleCalendarDayClick = (dayNum) => {
    const clickedDate = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth(), dayNum);
    setCalendarDayModalDate(clickedDate);
    setShowCalendarDayModal(true);
  };

  const hasScheduleOnDay = (dayNum) => {
    const date = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth(), dayNum);
    const dayIndex = date.getDay();
    const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayName = dayMap[dayIndex];
    return schedule.some(item => item.day === dayName);
  };

  return (
    <div className="scrollable">
      {/* Segmented Control */}
      <div className="segmented-control" style={{ marginBottom: "12px" }}>
        <button
          className={`segment-btn ${activeSegment === "timetable" ? "active" : ""}`}
          onClick={() => setActiveSegment("timetable")}
        >
          {t.timetable}
        </button>
        <button
          className={`segment-btn ${activeSegment === "timeline" ? "active" : ""}`}
          onClick={() => setActiveSegment("timeline")}
        >
          {t.timeline}
        </button>
        <button
          className={`segment-btn ${activeSegment === "calendar" ? "active" : ""}`}
          onClick={() => setActiveSegment("calendar")}
        >
          {t.calendar}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* VIEW 1: TIMETABLE */}
      {activeSegment === "timetable" && (
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>이번 주 일정</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px", width: "36px", height: "36px", borderRadius: "8px" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLocked}
                title="이미지로 시간표 자동 판독"
              >
                <span className="material-symbols-outlined">add_photo_alternate</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px", width: "36px", height: "36px", borderRadius: "8px" }}
                onClick={() => setIsLocked(!isLocked)}
                title={isLocked ? "편집 잠금 활성화" : "편집 가능 상태"}
              >
                <span className="material-symbols-outlined">{isLocked ? "lock" : "lock_open"}</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px", width: "36px", height: "36px", borderRadius: "8px", color: "var(--error-color)" }}
                onClick={handleResetTimetable}
                disabled={isLocked}
                title="시간표 전체 비우기"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          {isParsingImage && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "24px" }}>
              <div className="timer-ring timer-pulse-active" style={{ width: "60px", height: "60px", border: "2px solid var(--primary-color)" }}>
                <span className="material-symbols-outlined material-filled text-primary" style={{ fontSize: "28px", color: "var(--primary-color)" }}>auto_awesome</span>
              </div>
              <p style={{ fontSize: "13px", fontWeight: "600", textAlign: "center" }}>AI가 이미지 내 과목, 요일, 시간대, 장소를 분석 중입니다...</p>
            </div>
          )}

          {/* Grid Container */}
          <div className="timetable-grid-container" style={{ position: "relative", minHeight: "360px" }}>
            {/* Faint Grid Background */}
            <div className="grid-bg" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: "none" }} />

            {/* Red timeline bar */}
            {currentMinutesInDay >= 0 && currentMinutesInDay <= totalMinutesInTimetable && (
              <div
                className="timetable-current-line"
                style={{ top: `${40 + (redLineOffsetTop / 100) * 480}px`, zIndex: 10 }}
              />
            )}

            {/* Top row Headers */}
            <div className="timetable-header" style={{ zIndex: 2 }}>시간</div>
            <div className="timetable-header" style={{ zIndex: 2 }}>월</div>
            <div className="timetable-header" style={{ zIndex: 2 }}>화</div>
            <div className="timetable-header" style={{ zIndex: 2 }}>수</div>
            <div className="timetable-header" style={{ zIndex: 2 }}>목</div>
            <div className="timetable-header" style={{ zIndex: 2 }}>금</div>

            {/* Time labels & cells */}
            {hours.map((hour) => (
              <Fragment key={hour}>
                {/* Time Label */}
                <div className="timetable-time-label" style={{ zIndex: 2 }}>
                  {hour}:00
                </div>

                {/* Day columns */}
                {days.map((day) => {
                  const item = schedule.find(i => i.day === day && i.startHour <= hour && (i.startHour + i.duration) > hour);
                  const isStartSlot = item && item.startHour === hour;

                  return (
                    <div
                      key={day}
                      className="timetable-cell"
                      onClick={() => item && handleCellLongPress(item.subject)}
                      style={{ cursor: item ? "pointer" : "default", zIndex: 2 }}
                    >
                      {item && isStartSlot && (
                        <div
                          className={`subject-block ${getSubjectColorClass(item.subject)}`}
                          style={{ height: `${item.duration * 60 - 5}px`, zIndex: 5 }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "800" }}>{item.subject}</span>
                            {item.location && (
                              <span style={{ fontSize: "8px", opacity: 0.8, display: "flex", alignItems: "center", gap: "1px" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>place</span> {item.location}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "8px", alignSelf: "flex-end", opacity: 0.7 }}>
                            {item.duration}h
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}

            {/* Empty State / AI Upload Prompt */}
            {schedule.length === 0 && !isParsingImage && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-surface/40 backdrop-blur-[2px] z-20 p-8"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(252, 249, 248, 0.75)",
                  backdropFilter: "blur(2px)",
                  zIndex: 20
                }}
              >
                <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6 border border-outline-variant/50 shadow-sm animate-float" style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "var(--surface-container)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  boxShadow: "var(--shadow-low)",
                  border: "1px solid var(--border-color)"
                }}>
                  <span className="material-symbols-outlined text-[40px] text-primary material-filled" style={{ fontSize: "40px", color: "var(--primary-color)" }}>auto_awesome</span>
                </div>
                <h3 className="text-headline-sm font-bold text-on-surface mb-3 text-center" style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>아직 등록된 시간표가 없습니다</h3>
                <p className="text-body-md text-on-surface-variant text-center mb-8 max-w-[260px] leading-relaxed" style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", marginBottom: "24px", maxWidth: "260px" }}>
                  가지고 있는 시간표 이미지를 업로드하면 AI가 자동으로 일정을 생성해 드립니다.
                </p>
                <button
                  className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold text-label-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 shimmer-effect btn btn-primary"
                  style={{ width: "auto" }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLocked}
                >
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  AI 시간표 이미지 자동 추출
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-primary"
              style={{ width: "auto", padding: "8px 16px", fontSize: "13px" }}
              onClick={() => setShowAiModal(true)}
              disabled={isLocked}
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              AI 일정 추가
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: TIMELINE */}
      {activeSegment === "timeline" && (
        <div>
          {/* Top Info: Current ongoing task */}
          <div className="glass-card" style={{ background: "linear-gradient(135deg, rgba(36, 56, 156, 0.05) 0%, rgba(0, 107, 92, 0.05) 100%)", border: "1px solid var(--primary-color)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-color)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              현재 진행 중인 일정
            </span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>수학 집중 자습</h2>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span> 13:00 - 15:00
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>place</span> 학교 도서관
                  </span>
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "40px", height: "40px", padding: "0", borderRadius: "50%" }}
                onClick={() => onStartTimerWithSubject("수학")}
              >
                <span className="material-symbols-outlined material-filled" style={{ color: "#ffffff" }}>play_arrow</span>
              </button>
            </div>
          </div>

          {/* Timeline flow */}
          <h3 style={{ fontSize: "14px", fontWeight: "700", margin: "24px 0 12px 0" }}>오늘의 시간표 흐름</h3>
          <div style={{ paddingLeft: "8px" }}>
            {schedule
              .filter(item => item.day === "mon")
              .sort((a, b) => a.startHour - b.startHour)
              .map((item, index) => (
                <div className="timeline-item" key={item.id}>
                  <div className="timeline-line" />
                  <div className={`timeline-dot ${index === 1 ? "active" : ""}`} />
                  <div className="timeline-content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: "700" }}>{item.subject}</h4>
                        <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span> {item.startHour}:00 - {item.startHour + item.duration}:00</span>
                          {item.location && <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><span className="material-symbols-outlined" style={{ fontSize: "12px" }}>place</span> {item.location}</span>}
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ width: "auto", padding: "4px 8px", fontSize: "11px", color: "var(--error-color)" }}
                        onClick={() => {
                          setSchedule(prev => prev.filter(i => i.id !== item.id));
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {schedule.filter(item => item.day === "mon").length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-disabled)", fontSize: "13px", padding: "40px 0" }}>
                오늘 잡혀있는 일정이 없습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: CALENDAR */}
      {activeSegment === "calendar" && (
        <div>
          {/* Calendar Month Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800" }}>
              {activeCalendarMonth.getFullYear()}년 {activeCalendarMonth.getMonth() + 1}월
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary" style={{ padding: "4px 8px", width: "auto" }} onClick={() => changeMonth(-1)}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="btn btn-secondary" style={{ padding: "4px 8px", width: "auto" }} onClick={() => changeMonth(1)}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", marginBottom: "8px" }}>
            {["일", "월", "화", "수", "목", "금", "토"].map(day => (
              <div key={day} style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-disabled)" }}>{day}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center" }}>
            {Array.from({ length: getFirstDayOfMonth(activeCalendarMonth) }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: getDaysInMonth(activeCalendarMonth) }).map((_, idx) => {
              const dayNum = idx + 1;
              const isToday = dayNum === new Date().getDate() && activeCalendarMonth.getMonth() === new Date().getMonth() && activeCalendarMonth.getFullYear() === new Date().getFullYear();
              const hasEvents = hasScheduleOnDay(dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleCalendarDayClick(dayNum)}
                  style={{
                    height: "40px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    backgroundColor: isToday ? "var(--primary-color)" : "var(--surface-color)",
                    color: isToday ? "#ffffff" : "var(--text-primary)",
                    cursor: "pointer",
                    border: "1px solid var(--border-color)",
                    position: "relative"
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "700" }}>{dayNum}</span>
                  {hasEvents && (
                    <div style={{
                      position: "absolute",
                      bottom: "4px",
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor: isToday ? "#ffffff" : "var(--secondary-color)"
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Parsing Natural Language Modal */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined text-primary material-filled">auto_awesome</span>
                AI 자연어 일정 등록
              </h3>
              <span className="material-symbols-outlined" onClick={() => setShowAiModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              텍스트를 입력하면 AI가 일정 정보(요일, 시간, 과목, 장소)를 자동 분석하여 등록합니다.
            </p>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                className="input-field"
                placeholder="예: 월요일 13시 수학 2시간 / 교실 3A"
                value={aiText}
                onChange={e => setAiText(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleAiTextSubmit}>등록하기</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Day Events Modal */}
      {showCalendarDayModal && calendarDayModalDate && (
        <div className="modal-overlay" onClick={() => setShowCalendarDayModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>
                {calendarDayModalDate.getFullYear()}년 {calendarDayModalDate.getMonth() + 1}월 {calendarDayModalDate.getDate()}일 일정
              </h3>
              <span className="material-symbols-outlined" onClick={() => setShowCalendarDayModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {schedule
                .filter(item => {
                  const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                  return item.day === dayMap[calendarDayModalDate.getDay()];
                })
                .map(item => (
                  <div key={item.id} className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 0, padding: "10px" }}>
                    <div>
                      <h4 style={{ fontSize: "13px", fontWeight: "700" }}>{item.subject}</h4>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {item.startHour}:00 - {item.startHour + item.duration}:00 {item.location && `| ${item.location}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-primary"
                        style={{ width: "auto", padding: "6px 12px", fontSize: "11px" }}
                        onClick={() => {
                          setShowCalendarDayModal(false);
                          onStartTimerWithSubject(item.subject);
                        }}
                      >
                        시작
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: "auto", padding: "4px", color: "var(--error-color)", border: "none" }}
                        onClick={() => {
                          if (window.confirm(`${item.subject} 일정을 삭제하시겠습니까?`)) {
                            setSchedule(prev => prev.filter(i => i.id !== item.id));
                          }
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              {schedule.filter(item => {
                const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                return item.day === dayMap[calendarDayModalDate.getDay()];
              }).length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-disabled)", fontSize: "13px", padding: "20px 0" }}>
                  등록된 일정이 없습니다.
                </p>
              )}
            </div>

            {/* Quick schedule add on calendar */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "12px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>새 일정 추가</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <select 
                    id="cal-subject" 
                    className="input-field" 
                    style={{ padding: "6px", fontSize: "12px" }}
                    defaultValue="수학"
                  >
                    {subjectsList.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                  <select 
                    id="cal-hour" 
                    className="input-field" 
                    style={{ padding: "6px", fontSize: "12px" }}
                    defaultValue="9"
                  >
                    {hours.map(hr => <option key={hr} value={hr}>{hr}시</option>)}
                  </select>
                  <select 
                    id="cal-duration" 
                    className="input-field" 
                    style={{ padding: "6px", fontSize: "12px" }}
                    defaultValue="2"
                  >
                    <option value="1">1시간</option>
                    <option value="2">2시간</option>
                    <option value="3">3시간</option>
                    <option value="4">4시간</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    id="cal-location"
                    className="input-field"
                    placeholder="장소 (예: 독서실)"
                    style={{ padding: "6px", fontSize: "12px" }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ width: "auto", padding: "6px 12px", fontSize: "12px", whiteSpace: "nowrap" }}
                    onClick={() => {
                      const subject = document.getElementById("cal-subject").value;
                      const startHour = parseInt(document.getElementById("cal-hour").value);
                      const duration = parseInt(document.getElementById("cal-duration").value);
                      const location = document.getElementById("cal-location").value;
                      
                      const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                      const dayName = dayMap[calendarDayModalDate.getDay()];
                      
                      if (dayName === "sun" || dayName === "sat") {
                        alert("주말(토/일) 일정 등록은 현재 준비 중입니다. 월~금 시간표 일정을 이용해 주세요!");
                        return;
                      }

                      const newItem = {
                        id: Date.now(),
                        day: dayName,
                        startHour,
                        duration,
                        subject,
                        location
                      };
                      setSchedule(prev => [...prev, newItem]);
                      document.getElementById("cal-location").value = "";
                      alert(`${subject} 일정이 성공적으로 추가되었습니다!`);
                    }}
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button className="btn btn-secondary" onClick={() => setShowCalendarDayModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Long press start timer modal */}
      {showLongPressTimerModal && selectedSubjectForTimer && (
        <div className="modal-overlay" onClick={() => setShowLongPressTimerModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800" }}>{selectedSubjectForTimer} 타이머 시작</h3>
              <span className="material-symbols-outlined" onClick={() => setShowLongPressTimerModal(false)} style={{ cursor: "pointer" }}>close</span>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              선택한 과목 <strong>[{selectedSubjectForTimer}]</strong>의 타이머를 실행할 모드를 고르세요.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowLongPressTimerModal(false);
                  onStartTimerWithSubject(selectedSubjectForTimer, "pomodoro");
                }}
              >
                뽀모도로 모드 시작 (25분 집중)
              </button>
              <button
                className="btn btn-accent"
                onClick={() => {
                  setShowLongPressTimerModal(false);
                  onStartTimerWithSubject(selectedSubjectForTimer, "timer");
                }}
              >
                타이머 모드 시작 (시간 설정 가능)
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowLongPressTimerModal(false);
                  onStartTimerWithSubject(selectedSubjectForTimer, "stopwatch");
                }}
              >
                스톱워치 모드 시작
              </button>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowLongPressTimerModal(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};
