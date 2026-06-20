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

  // Drag-to-add state
  const [isDraggingSubject, setIsDraggingSubject] = useState(false);
  const [dragSubject, setDragSubject] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null); // { day, hour }
  const [showSubjectPalette, setShowSubjectPalette] = useState(false);

  const fileInputRef = useRef(null);

  // Time red line tracker
  const [currentMinutesInDay, setCurrentMinutesInDay] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const minutesSinceStart = (hours - 9) * 60 + minutes;
      setCurrentMinutesInDay(minutesSinceStart);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalMinutesInTimetable = 8 * 60;
  const redLineOffsetTop = (currentMinutesInDay / totalMinutesInTimetable) * 100;

  const days = ["mon", "tue", "wed", "thu", "fri"];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16];

  const subjectColorMap = {
    "수학": { bg: "#EDE7F6", text: "#4527A0", border: "#7E57C2" },
    "영어": { bg: "#E3F2FD", text: "#0D47A1", border: "#42A5F5" },
    "국어": { bg: "#FFF3E0", text: "#E65100", border: "#FFA726" },
    "과학": { bg: "#E8F5E9", text: "#1B5E20", border: "#66BB6A" },
    "사회": { bg: "#FCE4EC", text: "#880E4F", border: "#EC407A" },
    "역사": { bg: "#FBE9E7", text: "#BF360C", border: "#FF7043" },
    "물리": { bg: "#E0F7FA", text: "#006064", border: "#26C6DA" },
    "화학": { bg: "#F3E5F5", text: "#4A148C", border: "#AB47BC" },
    "생물": { bg: "#F1F8E9", text: "#33691E", border: "#9CCC65" },
    "정보": { bg: "#E8EAF6", text: "#1A237E", border: "#5C6BC0" },
    "체육": { bg: "#FFF8E1", text: "#F57F17", border: "#FFCA28" },
    "기타": { bg: "#ECEFF1", text: "#37474F", border: "#90A4AE" }
  };

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

  const getSubjectStyle = (subjectName) => {
    return subjectColorMap[subjectName] || subjectColorMap["기타"];
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

  const handleResetTimetable = () => {
    if (window.confirm("시간표를 정말 초기화하시겠습니까? 모든 정보가 사라집니다.")) {
      setSchedule([]);
    }
  };

  const handleAiTextSubmit = () => {
    if (!aiText.trim()) return;

    let parsedSubject = "기타";
    let parsedDay = "mon";
    let parsedHour = 9;
    let parsedDuration = 1;
    let parsedLocation = "";

    const matchedSub = subjectsList.find(sub => aiText.includes(sub));
    if (matchedSub) parsedSubject = matchedSub;

    if (aiText.includes("화요일") || aiText.includes("화")) parsedDay = "tue";
    else if (aiText.includes("수요일") || aiText.includes("수")) parsedDay = "wed";
    else if (aiText.includes("목요일") || aiText.includes("목")) parsedDay = "thu";
    else if (aiText.includes("금요일") || aiText.includes("금")) parsedDay = "fri";
    else if (aiText.includes("월요일") || aiText.includes("월")) parsedDay = "mon";

    const timeMatch = aiText.match(/(\d+)시/);
    if (timeMatch) {
      let hr = parseInt(timeMatch[1]);
      if (aiText.includes("오후") && hr < 12) hr += 12;
      if (aiText.includes("저녁") && hr < 12) hr += 12;
      if (hr >= 9 && hr <= 16) parsedHour = hr;
    }

    const durMatch = aiText.match(/(\d+)시간/);
    if (durMatch) parsedDuration = parseInt(durMatch[1]);

    if (aiText.includes("/")) parsedLocation = aiText.split("/")[1].trim();

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

  const handleCellLongPress = (subject) => {
    if (!subject) return;
    setSelectedSubjectForTimer(subject);
    setShowLongPressTimerModal(true);
  };

  // ── DRAG TO ADD ──────────────────────────────────────────────────────────────
  const handleSubjectDragStart = (e, subject) => {
    if (isLocked) return;
    setDragSubject(subject);
    setIsDraggingSubject(true);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCellDragOver = (e, day, hour) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverCell({ day, hour });
  };

  const handleCellDrop = (e, day, hour) => {
    e.preventDefault();
    if (!dragSubject) return;
    // Check for overlap
    const overlap = schedule.some(i => i.day === day && i.startHour <= hour && (i.startHour + i.duration) > hour);
    if (!overlap) {
      const newItem = {
        id: Date.now(),
        day,
        startHour: hour,
        duration: 1,
        subject: dragSubject,
        location: ""
      };
      setSchedule(prev => [...prev, newItem]);
    }
    setDragSubject(null);
    setIsDraggingSubject(false);
    setDragOverCell(null);
  };

  const handleCellDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDragEnd = () => {
    setDragSubject(null);
    setIsDraggingSubject(false);
    setDragOverCell(null);
  };

  // ── CALENDAR HELPERS ─────────────────────────────────────────────────────────
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (val) => {
    setActiveCalendarMonth(new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth() + val, 1));
  };

  const handleCalendarDayClick = (dayNum) => {
    const clickedDate = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth(), dayNum);
    setCalendarDayModalDate(clickedDate);
    setShowCalendarDayModal(true);
  };

  const getScheduleOnDay = (dayNum) => {
    const date = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth(), dayNum);
    const dayIndex = date.getDay();
    const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayName = dayMap[dayIndex];
    return schedule.filter(item => item.day === dayName);
  };

  const today = new Date();

  return (
    <div className="scrollable">
      {/* Segmented Control */}
      <div className="segmented-control" style={{ marginBottom: "12px" }}>
        <button className={`segment-btn ${activeSegment === "timetable" ? "active" : ""}`} onClick={() => setActiveSegment("timetable")}>{t.timetable}</button>
        <button className={`segment-btn ${activeSegment === "timeline" ? "active" : ""}`} onClick={() => setActiveSegment("timeline")}>{t.timeline}</button>
        <button className={`segment-btn ${activeSegment === "calendar" ? "active" : ""}`} onClick={() => setActiveSegment("calendar")}>{t.calendar}</button>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImageFileChange} accept="image/*" style={{ display: "none" }} />

      {/* ═══ VIEW 1: TIMETABLE ═══════════════════════════════════════════════ */}
      {activeSegment === "timetable" && (
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
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

          {/* Subject Palette (shown when unlocked) */}
          {!isLocked && (
            <div style={{ marginBottom: "10px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", marginBottom: "6px" }}
                onClick={() => setShowSubjectPalette(p => !p)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--primary-color)" }}>drag_indicator</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-color)" }}>
                  과목을 셀로 드래그하여 추가 {showSubjectPalette ? "▲" : "▼"}
                </span>
              </div>
              {showSubjectPalette && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "6px",
                  background: "var(--surface-container)",
                  borderRadius: "12px", padding: "10px",
                  border: "1px dashed var(--border-color)",
                  animation: "fadeIn 0.15s ease"
                }}>
                  {subjectsList.map(sub => {
                    const style = getSubjectStyle(sub);
                    return (
                      <div
                        key={sub}
                        draggable
                        onDragStart={(e) => handleSubjectDragStart(e, sub)}
                        onDragEnd={handleDragEnd}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "grab",
                          background: style.bg,
                          color: style.text,
                          border: `1.5px solid ${style.border}`,
                          userSelect: "none",
                          transition: "transform 0.1s ease, box-shadow 0.1s ease",
                          boxShadow: dragSubject === sub ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                          transform: dragSubject === sub ? "scale(1.05)" : "scale(1)"
                        }}
                      >
                        {sub}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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

            {hours.map((hour) => (
              <Fragment key={hour}>
                <div className="timetable-time-label" style={{ zIndex: 2 }}>{hour}:00</div>

                {days.map((day) => {
                  const item = schedule.find(i => i.day === day && i.startHour <= hour && (i.startHour + i.duration) > hour);
                  const isStartSlot = item && item.startHour === hour;
                  const isHovered = dragOverCell && dragOverCell.day === day && dragOverCell.hour === hour;
                  const isDragBusy = item && !isStartSlot;

                  return (
                    <div
                      key={day}
                      className="timetable-cell"
                      onClick={() => item && handleCellLongPress(item.subject)}
                      onDragOver={(e) => !isDragBusy && handleCellDragOver(e, day, hour)}
                      onDrop={(e) => handleCellDrop(e, day, hour)}
                      onDragLeave={handleCellDragLeave}
                      style={{
                        cursor: item ? "pointer" : isDraggingSubject && !isLocked ? "copy" : "default",
                        zIndex: 2,
                        background: isHovered && !item ? "rgba(36,56,156,0.12)" : "transparent",
                        border: isHovered && !item ? "2px dashed var(--primary-color)" : undefined,
                        transition: "background 0.1s ease, border 0.1s ease",
                        borderRadius: isHovered ? "6px" : undefined
                      }}
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
                            {item.notes && (
                              <span style={{ fontSize: "8px", opacity: 0.8, display: "flex", alignItems: "center", gap: "1px" }} title={item.notes}>
                                <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>edit_note</span> {item.notes}
                              </span>
                            )}
                          </div>
                          {!isLocked && (
                            <span
                              style={{ fontSize: "8px", alignSelf: "flex-end", opacity: 0.7, cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSchedule(prev => prev.filter(i => i.id !== item.id));
                              }}
                            >✕</span>
                          )}
                          {isLocked && (
                            <span style={{ fontSize: "8px", alignSelf: "flex-end", opacity: 0.7 }}>{item.duration}h</span>
                          )}
                        </div>
                      )}
                      {/* Drop hint when dragging over empty cell */}
                      {isHovered && !item && (
                        <div style={{
                          position: "absolute", inset: "2px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "16px", opacity: 0.5, pointerEvents: "none"
                        }}>＋</div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}

            {/* Empty State */}
            {schedule.length === 0 && !isParsingImage && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                backgroundColor: "rgba(252, 249, 248, 0.75)", backdropFilter: "blur(2px)", zIndex: 20
              }}>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  backgroundColor: "var(--surface-container)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "24px", boxShadow: "var(--shadow-low)", border: "1px solid var(--border-color)"
                }}>
                  <span className="material-symbols-outlined text-[40px] text-primary material-filled" style={{ fontSize: "40px", color: "var(--primary-color)" }}>auto_awesome</span>
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>아직 등록된 시간표가 없습니다</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", marginBottom: "24px", maxWidth: "260px" }}>
                  이미지를 업로드하거나 과목 팔레트에서 셀로 드래그해서 추가하세요.
                </p>
                <button
                  className="btn btn-primary"
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

      {/* ═══ VIEW 2: TIMELINE ════════════════════════════════════════════════ */}
      {activeSegment === "timeline" && (
        <div>
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
                          {item.notes && <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--primary-color)", fontWeight: "600" }}><span className="material-symbols-outlined" style={{ fontSize: "12px" }}>edit_note</span> {item.notes}</span>}
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ width: "auto", padding: "4px 8px", fontSize: "11px", color: "var(--error-color)" }}
                        onClick={() => setSchedule(prev => prev.filter(i => i.id !== item.id))}
                      >삭제</button>
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

      {/* ═══ VIEW 3: CALENDAR ════════════════════════════════════════════════ */}
      {activeSegment === "calendar" && (
        <div>
          {/* Month Navigation Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "20px",
            background: "linear-gradient(135deg, var(--primary-color) 0%, #3f51b5 100%)",
            borderRadius: "20px", padding: "16px 20px", color: "#fff"
          }}>
            <div>
              <p style={{ fontSize: "11px", opacity: 0.8, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {today.getFullYear() === activeCalendarMonth.getFullYear() &&
                  today.getMonth() === activeCalendarMonth.getMonth() ? "이번 달" : "선택된 달"}
              </p>
              <h3 style={{ fontSize: "22px", fontWeight: "900", marginTop: "2px" }}>
                {activeCalendarMonth.getFullYear()}년 {activeCalendarMonth.getMonth() + 1}월
              </h3>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => changeMonth(-1)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                  width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_left</span>
              </button>
              <button
                onClick={() => setActiveCalendarMonth(new Date())}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                  padding: "0 12px", height: "36px", borderRadius: "18px", cursor: "pointer",
                  fontSize: "11px", fontWeight: "700", backdropFilter: "blur(4px)"
                }}
              >오늘</button>
              <button
                onClick={() => changeMonth(1)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                  width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_right</span>
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", marginBottom: "6px" }}>
            {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
              <div key={day} style={{
                fontSize: "11px", fontWeight: "800",
                color: i === 0 ? "#EF5350" : i === 6 ? "#42A5F5" : "var(--text-disabled)",
                padding: "4px 0"
              }}>{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {Array.from({ length: getFirstDayOfMonth(activeCalendarMonth) }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: getDaysInMonth(activeCalendarMonth) }).map((_, idx) => {
              const dayNum = idx + 1;
              const isToday = dayNum === today.getDate() &&
                activeCalendarMonth.getMonth() === today.getMonth() &&
                activeCalendarMonth.getFullYear() === today.getFullYear();
              const dayEvents = getScheduleOnDay(dayNum);
              const hasEvents = dayEvents.length > 0;

              // Determine day of week color
              const date = new Date(activeCalendarMonth.getFullYear(), activeCalendarMonth.getMonth(), dayNum);
              const dow = date.getDay();
              const isSun = dow === 0;
              const isSat = dow === 6;

              // Get up to 2 unique subject colors for dots
              const eventSubjects = [...new Set(dayEvents.map(e => e.subject))].slice(0, 3);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleCalendarDayClick(dayNum)}
                  style={{
                    minHeight: "52px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "6px",
                    borderRadius: "12px",
                    backgroundColor: isToday ? "var(--primary-color)" : "var(--surface-color)",
                    color: isToday ? "#ffffff" : isSun ? "#EF5350" : isSat ? "#42A5F5" : "var(--text-primary)",
                    cursor: "pointer",
                    border: isToday ? "none" : "1px solid var(--border-color)",
                    boxShadow: isToday ? "0 4px 12px rgba(36,56,156,0.3)" : "none",
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => { if (!isToday) e.currentTarget.style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <span style={{ fontSize: "13px", fontWeight: isToday ? "900" : "700" }}>{dayNum}</span>
                  {/* Event dots */}
                  {hasEvents && (
                    <div style={{ display: "flex", gap: "2px", marginTop: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                      {eventSubjects.map(sub => (
                        <div key={sub} style={{
                          width: "5px", height: "5px", borderRadius: "50%",
                          backgroundColor: isToday ? "rgba(255,255,255,0.8)" : (subjectColorMap[sub]?.border || "#90A4AE")
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.entries(subjectColorMap).slice(0, 6).map(([sub, style]) => (
              <div key={sub} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: style.border }} />
                <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600" }}>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── AI Modal ─────────────────────────────────────────────────────────── */}
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

      {/* ─── Calendar Day Modal ────────────────────────────────────────────────── */}
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
                .sort((a, b) => a.startHour - b.startHour)
                .map(item => {
                  const style = getSubjectStyle(item.subject);
                  return (
                    <div key={item.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: style.bg, borderRadius: "12px", padding: "10px 14px",
                      border: `1.5px solid ${style.border}`
                    }}>
                      <div>
                        <h4 style={{ fontSize: "13px", fontWeight: "800", color: style.text }}>{item.subject}</h4>
                        <p style={{ fontSize: "11px", color: style.text, opacity: 0.8, marginTop: "2px" }}>
                          {item.startHour}:00 - {item.startHour + item.duration}:00 {item.location && `| ${item.location}`}
                        </p>
                        {item.notes && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: style.text, opacity: 0.9, marginTop: "4px", fontWeight: "600" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>edit_note</span>
                            <span>{item.notes}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-primary"
                          style={{ width: "auto", padding: "6px 12px", fontSize: "11px" }}
                          onClick={() => { setShowCalendarDayModal(false); onStartTimerWithSubject(item.subject); }}
                        >시작</button>
                        <button
                          style={{ background: "rgba(0,0,0,0.08)", border: "none", borderRadius: "8px", padding: "6px 8px", cursor: "pointer", color: "var(--error-color)" }}
                          onClick={() => { if (window.confirm(`${item.subject} 일정을 삭제하시겠습니까?`)) setSchedule(prev => prev.filter(i => i.id !== item.id)); }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              {schedule.filter(item => {
                const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                return item.day === dayMap[calendarDayModalDate.getDay()];
              }).length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-disabled)", fontSize: "13px", padding: "20px 0" }}>
                  등록된 일정이 없습니다.
                </p>
              )}
            </div>

            {/* Quick schedule add */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "12px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>새 일정 추가</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <select id="cal-subject" className="input-field" style={{ padding: "6px", fontSize: "12px" }} defaultValue="수학">
                    {subjectsList.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                  <select id="cal-hour" className="input-field" style={{ padding: "6px", fontSize: "12px" }} defaultValue="9">
                    {hours.map(hr => <option key={hr} value={hr}>{hr}시</option>)}
                  </select>
                  <select id="cal-duration" className="input-field" style={{ padding: "6px", fontSize: "12px" }} defaultValue="2">
                    <option value="1">1시간</option>
                    <option value="2">2시간</option>
                    <option value="3">3시간</option>
                    <option value="4">4시간</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input type="text" id="cal-location" className="input-field" placeholder="장소 (예: 독서실)" style={{ padding: "6px", fontSize: "12px" }} />
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
                      setSchedule(prev => [...prev, { id: Date.now(), day: dayName, startHour, duration, subject, location }]);
                      document.getElementById("cal-location").value = "";
                      alert(`${subject} 일정이 성공적으로 추가되었습니다!`);
                    }}
                  >추가</button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button className="btn btn-secondary" onClick={() => setShowCalendarDayModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Long press timer modal ────────────────────────────────────────────── */}
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
              <button className="btn btn-primary" onClick={() => { setShowLongPressTimerModal(false); onStartTimerWithSubject(selectedSubjectForTimer, "pomodoro"); }}>
                뽀모도로 모드 시작 (25분 집중)
              </button>
              <button className="btn btn-accent" onClick={() => { setShowLongPressTimerModal(false); onStartTimerWithSubject(selectedSubjectForTimer, "timer"); }}>
                타이머 모드 시작 (시간 설정 가능)
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowLongPressTimerModal(false); onStartTimerWithSubject(selectedSubjectForTimer, "stopwatch"); }}>
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
