/**
 * Natural Language Processing Parser for StudyFlow AI Chat Assistant
 */
export const parseNaturalLanguage = (text, subjectsList) => {
  const normalized = text.trim();
  
  // Helper to find subject in text
  let subject = "기타";
  const matchedSubject = subjectsList.find(sub => normalized.includes(sub));
  if (matchedSubject) {
    subject = matchedSubject;
  } else if (normalized.includes("공부") || normalized.includes("자습") || normalized.includes("학습")) {
    subject = "자율학습";
  }

  // Determine relative or absolute Day
  const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayNamesKr = {
    "월요일": "mon", "화요일": "tue", "수요일": "wed", "목요일": "thu", "금요일": "fri", "토요일": "sat", "일요일": "sun",
    "월": "mon", "화": "tue", "수": "wed", "목": "thu", "금": "fri", "토": "sat", "일": "sun"
  };

  let day = "mon"; // Default
  let dayMatched = false;

  const today = new Date();
  const todayIdx = today.getDay();

  if (normalized.includes("오늘")) {
    day = dayMap[todayIdx];
    dayMatched = true;
  } else if (normalized.includes("내일")) {
    day = dayMap[(todayIdx + 1) % 7];
    dayMatched = true;
  } else if (normalized.includes("모레")) {
    day = dayMap[(todayIdx + 2) % 7];
    dayMatched = true;
  } else {
    // Check specific day names
    for (const [key, value] of Object.entries(dayNamesKr)) {
      if (normalized.includes(key)) {
        day = value;
        dayMatched = true;
        break;
      }
    }
  }

  // ── 1. TIMER COMMANDS ───────────────────────────────────────────────────
  const isTimer = normalized.includes("타이머") || normalized.includes("timer") || 
                  normalized.includes("뽀모도로") || normalized.includes("pomodoro") || 
                  normalized.includes("스톱워치") || normalized.includes("스탑워치") || 
                  normalized.includes("stopwatch") ||
                  // e.g. "수학 30분 시작"
                  ((normalized.includes("분") || normalized.includes("시간")) && (normalized.includes("시작") || normalized.includes("작동") || normalized.includes("켜")));

  if (isTimer) {
    // Mode
    let mode = "timer";
    if (normalized.includes("뽀모도로") || normalized.includes("pomodoro")) {
      mode = "pomodoro";
    } else if (normalized.includes("스톱워치") || normalized.includes("스탑워치") || normalized.includes("stopwatch")) {
      mode = "stopwatch";
    }

    // Extract duration (e.g., 30분, 1시간, 2시간)
    let minutes = null;
    const minMatch = normalized.match(/(\d+)\s*분/);
    const hourMatch = normalized.match(/(\d+)\s*시간/);
    if (minMatch) {
      minutes = parseInt(minMatch[1]);
    } else if (hourMatch) {
      minutes = parseInt(hourMatch[1]) * 60;
    } else if (mode === "pomodoro") {
      minutes = 25; // Default Pomodoro work time
    } else if (mode === "timer") {
      minutes = 60; // Default Timer
    }

    const autoStart = normalized.includes("시작") || normalized.includes("작동") || normalized.includes("켜") || normalized.includes("run") || normalized.includes("play");
    
    // Subject fallback for timer
    const finalSubject = subject === "기타" ? "자율학습" : subject;
    
    const modeLabel = mode === "pomodoro" ? "뽀모도로" : mode === "stopwatch" ? "스톱워치" : "타이머";
    const durLabel = minutes ? `${minutes}분` : "";
    const actionLabel = autoStart ? "작동함" : "설정";

    return {
      type: "timer",
      subject: finalSubject,
      timerMode: mode,
      minutes,
      autoStart,
      responseMessage: `✅ [${finalSubject}] ${durLabel} ${modeLabel}을 ${actionLabel}합니다!`
    };
  }

  // ── 2. MEMO / SUPPLIES / HOMEWORK COMMANDS ──────────────────────────────
  const isMemo = normalized.includes("준비물") || normalized.includes("숙제") || 
                 normalized.includes("과제") || normalized.includes("메모") || 
                 normalized.includes("노트") || normalized.includes("할일") || 
                 normalized.includes("할 일") || normalized.includes("챙길");

  if (isMemo) {
    // Extract memo content
    let memoText;
    const memoKeywords = ["준비물", "숙제", "과제", "메모", "노트", "할일", "할 일", "챙길"];
    let foundKeyword = "";
    for (const kw of memoKeywords) {
      if (normalized.includes(kw)) {
        foundKeyword = kw;
        break;
      }
    }

    if (foundKeyword) {
      const idx = normalized.indexOf(foundKeyword);
      memoText = normalized.substring(idx).trim();
    } else {
      memoText = normalized;
    }

    const dayLabel = day === "mon" ? "월요일" : day === "tue" ? "화요일" : day === "wed" ? "수요일" : day === "thu" ? "목요일" : day === "fri" ? "금요일" : day === "sat" ? "토요일" : "일요일";
    const finalSubject = subject === "기타" ? "자율학습" : subject;

    return {
      type: "memo",
      subject: finalSubject,
      day,
      memoText,
      responseMessage: `📝 ${dayLabel} [${finalSubject}] 일정에 메모 "${memoText}"를 등록했습니다!`
    };
  }

  // ── 3. SCHEDULE REGISTRATION COMMANDS ───────────────────────────────────
  const isSchedule = dayMatched || normalized.includes("시") || normalized.includes("시간") || normalized.includes("등록") || normalized.includes("추가");

  if (isSchedule) {
    let parsedHour = 9; // Default
    let parsedDuration = 1; // Default
    let parsedLocation = "";

    const timeMatch = normalized.match(/(\d+)\s*시/);
    if (timeMatch) {
      let hr = parseInt(timeMatch[1]);
      if (normalized.includes("오후") && hr < 12) hr += 12;
      if (normalized.includes("저녁") && hr < 12) hr += 12;
      if (hr >= 0 && hr <= 24) parsedHour = hr;
    }

    const durMatch = normalized.match(/(\d+)\s*시간/);
    if (durMatch) {
      parsedDuration = parseInt(durMatch[1]);
    }

    if (normalized.includes("/")) {
      parsedLocation = normalized.split("/")[1].trim();
    } else {
      const locMatch = normalized.match(/(교실\s*\w+|도서관|과학실|어학실|음악실|체육관|독서실|컴퓨터실)/);
      if (locMatch) {
        parsedLocation = locMatch[1];
      }
    }

    const dayLabel = day === "mon" ? "월요일" : day === "tue" ? "화요일" : day === "wed" ? "수요일" : day === "thu" ? "목요일" : day === "fri" ? "금요일" : day === "sat" ? "토요일" : "일요일";
    const finalSubject = subject === "기타" ? "자율학습" : subject;

    return {
      type: "schedule",
      subject: finalSubject,
      day,
      startHour: parsedHour,
      duration: parsedDuration,
      location: parsedLocation,
      responseMessage: `📅 ${dayLabel} ${parsedHour}시 [${finalSubject}] ${parsedDuration}시간 일정을 등록했습니다!${parsedLocation ? ` (장소: ${parsedLocation})` : ""}`
    };
  }

  // Fallback
  return {
    type: "unknown",
    responseMessage: `🤖 말씀하신 내용을 이해하지 못했어요. 아래와 같이 입력해보세요!\n\n• "수학 30분 타이머 작동함"\n• "수학 내일 준비물 자"\n• "월요일 13시 영어 2시간 / 어학실"`
  };
};
