import { useState, useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Timetable } from "./components/Timetable";
import { StudyTimer } from "./components/StudyTimer";
import { Stats } from "./components/Stats";
import { Settings } from "./components/Settings";
import { Group } from "./components/Group";
import { Login } from "./components/Login";
import { parseNaturalLanguage } from "./utils/aiParser";

// Translation dictionaries
const translations = {
  ko: {
    // Nav
    level: "레벨", timetable: "시간표", timeline: "일정표", calendar: "캘린더",
    timer: "타이머", group: "그룹", stats: "통계", settings: "설정",
    // Auth
    logout: "로그아웃",
    // Timetable
    lock: "잠금", unlock: "편집",
    thisWeek: "이번 주 일정",
    addSubject: "과목 추가",
    dragToAdd: "과목을 셀로 드래그하여 추가",
    aiAddSchedule: "AI 일정 추가",
    aiImageScan: "AI 시간표 이미지 추출",
    noTimetable: "아직 등록된 시간표가 없습니다",
    noTimetableDesc: "이미지를 업로드하거나 과목 팔레트에서 드래그해서 추가하세요.",
    resetTimetable: "시간표 초기화",
    // Timer
    pomodoro: "뽀모도로", timerMode: "타이머", stopwatch: "스톱워치",
    start: "시작", pause: "일시정지", resume: "계속", stop: "종료",
    focusTime: "집중 시간 (분)", breakTime: "휴식 시간 (분)", timerSetting: "타이머 시간 설정 (분)",
    clickToEdit: "시계를 클릭하여 시간 편집",
    studyTimeSetting: "학습 시간 설정",
    selectRest: "어떤 휴식을 하시겠습니까?",
    restDesc: "선택한 휴식 유형과 시간이 분석 통계에 자동 기록됩니다.",
    meal: "식사", rest: "휴식", sleep: "수면", other: "기타",
    customRest: "직접 입력 (예: 스트레칭)",
    cancel: "취소", save: "저장", confirm: "입력",
    // Group
    studyGroup: "스터디 그룹",
    joinGroup: "스터디 그룹 참가하기",
    joinGroupDesc: "초대 코드를 주고받아 실시간으로 공부 시간을 공유하고 공동 목표를 설정하세요.",
    enterCode: "초대 코드 입력 (6자리)",
    join: "참가",
    createGroup: "새로운 그룹 만들기",
    groupBenefits: "그룹 스터디 혜택",
    benefit1: "목표 달성 시 경험치 2배!",
    benefit2: "멤버 실시간 공부 현황 확인",
    benefit3: "그룹 랭킹 및 업적 시스템",
    groupGoalSet: "그룹 목표 설정",
    mathGoal: "공동 수학 목표 (시간)",
    englishGoal: "공동 영어 목표 (시간)",
    memberStatus: "멤버 실시간 현황",
    tapForMsg: "탭하여 메시지 보기",
    studyingNow: "공부 중", away: "자리 비움",
    goalProgress: "오늘 목표 달성도",
    achieved: "달성!", goalAchievedBonus: "공동 목표 달성! EXP 2배 보너스 적용 중 🎉",
    leaveGroup: "그룹 탈퇴",
    leaveGroupConfirm: "그룹에서 탈퇴하시겠습니까?",
    inviteCode: "초대 코드:",
    adjustGoal: "수정",
    jointGoal: "공동 목표:",
    activeGroup: "진행 중 · 스터디 그룹",
    // Stats
    currentRank: "현재 학습 등급",
    totalStudy: "누적 학습",
    longestFocus: "최장 집중",
    studyAnalysis: "학습 시간 분석",
    daily: "일간", weekly: "주간", monthly: "월간",
    subjectRatio: "과목별 학습 비율",
    totalStudyLabel: "총 학습",
    noRecord: "아직 학습 기록 없음",
    top3: "집중 과목 Top 3",
    noSubjectRecord: "아직 기록된 과목별 학습이 없습니다.",
    restRatio: "휴식 유형별 비율",
    achievements: "학습 업적 달성 현황",
    // Settings
    profileChange: "내 프로필 변경",
    nicknameInput: "닉네임 입력",
    change: "변경",
    avatarChange: "캐릭터 아바타 변경",
    themeSettings: "앱 테마 설정",
    darkMode: "다크모드 활성화",
    focusMode: "공부 집중 모드",
    allowNotif: "집중 중 원하는 앱 알림만 허용",
    allowedApps: "허용할 앱 선택",
    timerOptions: "타이머 집중 옵션",
    flipToFocus: "휴대폰 뒤집어야 타이머 시작",
    notifType: "타이머 완료 알림 방식",
    notifSound: "알림음 재생", notifVibrate: "진동 발생", notifBoth: "알림음 + 진동 둘 다",
    languageSettings: "글로벌 언어 설정 (Language)",
    devTools: "관리자 개발자 도구",
    subjectManage: "과목 관리",
    addCustomSubject: "새 과목 추가",
    subjectName: "과목 이름 입력",
    deleteAccount: "회원 탈퇴 (서버 데이터 영구 삭제)",
    deleteAccountConfirm: "회원 탈퇴를 진행하시겠습니까? 클라우드 및 서버의 모든 개인 학습 정보가 완전히 삭제됩니다.",
    // AI
    aiAssistant: "AI 어시스턴트",
    aiAsk: "AI에게 질문하기...",
    aiScheduleReg: "AI 인공지능 일정 등록기",
    aiPlaceholder: "예: 수학 타이머 시작 / 영어 뽀모도로 시작 / 내일 오후 3시 과학 2시간",
    // Misc
    alertSaved: "학습 기록이 저장되었습니다!",
    levelup: "축하합니다! 레벨업 하셨습니다!",
    selfStudy: "자율학습",
    me: "나",
    send: "전송"
  },
  en: {
    level: "Lv", timetable: "Timetable", timeline: "Timeline", calendar: "Calendar",
    timer: "Timer", group: "Group", stats: "Stats", settings: "Settings",
    logout: "Logout",
    lock: "Lock", unlock: "Edit",
    thisWeek: "This Week",
    addSubject: "Add Subject",
    dragToAdd: "Drag subjects to cells to add",
    aiAddSchedule: "AI Add Schedule",
    aiImageScan: "AI Timetable Scan",
    noTimetable: "No timetable registered yet",
    noTimetableDesc: "Upload an image or drag from the palette to add.",
    resetTimetable: "Reset Timetable",
    pomodoro: "Pomodoro", timerMode: "Timer", stopwatch: "Stopwatch",
    start: "Start", pause: "Pause", resume: "Resume", stop: "Stop",
    focusTime: "Focus time (min)", breakTime: "Break time (min)", timerSetting: "Timer setting (min)",
    clickToEdit: "Click clock to edit time",
    studyTimeSetting: "Study Time Settings",
    selectRest: "What kind of break?",
    restDesc: "Selected rest type and duration will be recorded in your stats.",
    meal: "Meal", rest: "Rest", sleep: "Sleep", other: "Other",
    customRest: "Custom (e.g. stretching)",
    cancel: "Cancel", save: "Save", confirm: "Enter",
    studyGroup: "Study Group",
    joinGroup: "Join a Study Group",
    joinGroupDesc: "Share study time in real-time and set common goals.",
    enterCode: "Enter invite code (6 chars)",
    join: "Join",
    createGroup: "Create a New Group",
    groupBenefits: "Group Study Benefits",
    benefit1: "2x EXP on goal achievement!",
    benefit2: "Real-time member study tracking",
    benefit3: "Group ranking & achievements",
    groupGoalSet: "Set Group Goal",
    mathGoal: "Math goal (hours)",
    englishGoal: "English goal (hours)",
    memberStatus: "Members Live Status",
    tapForMsg: "Tap to send message",
    studyingNow: "Studying", away: "Away",
    goalProgress: "Today's goal progress",
    achieved: "Done!", goalAchievedBonus: "Goal reached! 2x EXP bonus active 🎉",
    leaveGroup: "Leave Group",
    leaveGroupConfirm: "Leave the group?",
    inviteCode: "Invite Code:",
    adjustGoal: "Edit",
    jointGoal: "Joint Goal:",
    activeGroup: "Active Study Group",
    currentRank: "Current Study Rank",
    totalStudy: "Total Study",
    longestFocus: "Longest Focus",
    studyAnalysis: "Study Time Analysis",
    daily: "Daily", weekly: "Weekly", monthly: "Monthly",
    subjectRatio: "Subject Study Ratio",
    totalStudyLabel: "Total Study",
    noRecord: "No study records yet",
    top3: "Top 3 Subjects",
    noSubjectRecord: "No subject records yet.",
    restRatio: "Rest Type Ratio",
    achievements: "Study Achievements",
    profileChange: "Edit Profile",
    nicknameInput: "Enter nickname",
    change: "Change",
    avatarChange: "Change Avatar",
    themeSettings: "App Theme",
    darkMode: "Enable Dark Mode",
    focusMode: "Study Focus Mode",
    allowNotif: "Allow certain app notifications during focus",
    allowedApps: "Select Allowed Apps",
    timerOptions: "Timer Focus Options",
    flipToFocus: "Flip phone to start timer",
    notifType: "Timer alert type",
    notifSound: "Sound", notifVibrate: "Vibrate", notifBoth: "Sound + Vibrate",
    languageSettings: "Language Settings",
    devTools: "Developer Tools",
    subjectManage: "Subject Management",
    addCustomSubject: "Add New Subject",
    subjectName: "Enter subject name",
    deleteAccount: "Delete Account (permanent)",
    deleteAccountConfirm: "Delete your account? All cloud data will be permanently erased.",
    aiAssistant: "AI Assistant",
    aiAsk: "Ask AI...",
    aiScheduleReg: "AI Schedule Registrar",
    aiPlaceholder: "e.g., Start math timer / Start english pomodoro / Science tomorrow 3pm 2h",
    alertSaved: "Study session saved!",
    levelup: "Congratulations! Level Up!",
    selfStudy: "Self Study",
    me: "Me",
    send: "Send"
  },
  jp: {
    level: "レベル", timetable: "時間割", timeline: "タイムライン", calendar: "カレンダー",
    timer: "タイマー", group: "グループ", stats: "統計", settings: "設定",
    logout: "ログアウト",
    lock: "ロック", unlock: "編集",
    thisWeek: "今週の予定",
    addSubject: "科目追加",
    dragToAdd: "科目をセルにドラッグして追加",
    aiAddSchedule: "AI予定追加",
    aiImageScan: "AI時間割スキャン",
    noTimetable: "まだ時間割がありません",
    noTimetableDesc: "画像をアップロードするかドラッグして追加してください。",
    resetTimetable: "時間割リセット",
    pomodoro: "ポモドーロ", timerMode: "タイマー", stopwatch: "ストップウォッチ",
    start: "開始", pause: "一時停止", resume: "再開", stop: "終了",
    focusTime: "集中時間（分）", breakTime: "休憩時間（分）", timerSetting: "タイマー設定（分）",
    clickToEdit: "時計をクリックして時間編集",
    studyTimeSetting: "学習時間設定",
    selectRest: "どんな休憩をしますか？",
    restDesc: "選択した休憩タイプが統計に記録されます。",
    meal: "食事", rest: "休憩", sleep: "睡眠", other: "その他",
    customRest: "カスタム入力",
    cancel: "キャンセル", save: "保存", confirm: "入力",
    studyGroup: "勉強グループ",
    joinGroup: "グループに参加",
    joinGroupDesc: "リアルタイムで学習時間を共有し、共同目標を設定しましょう。",
    enterCode: "招待コードを入力（6文字）",
    join: "参加",
    createGroup: "新しいグループを作成",
    groupBenefits: "グループ学習の特典",
    benefit1: "目標達成でEXP2倍！",
    benefit2: "メンバーのリアルタイム学習確認",
    benefit3: "グループランキングと実績",
    groupGoalSet: "グループ目標設定",
    mathGoal: "数学の共同目標（時間）",
    englishGoal: "英語の共同目標（時間）",
    memberStatus: "メンバーリアルタイム状況",
    tapForMsg: "タップしてメッセージ",
    studyingNow: "勉強中", away: "離席中",
    goalProgress: "今日の目標達成度",
    achieved: "達成！", goalAchievedBonus: "共同目標達成！EXP2倍ボーナス適用中 🎉",
    leaveGroup: "グループ退出",
    leaveGroupConfirm: "グループを退出しますか？",
    inviteCode: "招待コード:",
    adjustGoal: "修正",
    jointGoal: "共同目標:",
    activeGroup: "進行中・勉強グループ",
    currentRank: "現在の学習等級",
    totalStudy: "累積学習",
    longestFocus: "最長集中",
    studyAnalysis: "学習時間分析",
    daily: "日間", weekly: "週間", monthly: "月間",
    subjectRatio: "科目別学習比率",
    totalStudyLabel: "合計学習",
    noRecord: "まだ学習記録なし",
    top3: "集中科目 Top 3",
    noSubjectRecord: "まだ科目別記録がありません。",
    restRatio: "休憩タイプ別比率",
    achievements: "学習実績達成状況",
    profileChange: "プロフィール変更",
    nicknameInput: "ニックネーム入力",
    change: "変更",
    avatarChange: "アバター変更",
    themeSettings: "テーマ設定",
    darkMode: "ダークモード有効",
    focusMode: "集中モード",
    allowNotif: "集中中に特定アプリの通知を許可",
    allowedApps: "許可するアプリを選択",
    timerOptions: "タイマー集中オプション",
    flipToFocus: "スマホを裏返してタイマー開始",
    notifType: "タイマー完了通知方法",
    notifSound: "通知音", notifVibrate: "バイブ", notifBoth: "通知音+バイブ",
    languageSettings: "言語設定",
    devTools: "開発者ツール",
    subjectManage: "科目管理",
    addCustomSubject: "新しい科目を追加",
    subjectName: "科目名を入力",
    deleteAccount: "アカウント削除",
    deleteAccountConfirm: "退会しますか？すべてのデータが完全に削除されます。",
    aiAssistant: "AI アシスタント",
    aiAsk: "AIに質問する...",
    aiScheduleReg: "AI予定登録",
    aiPlaceholder: "例: 数学タイマー開始 / 英語ポモドーロ開始",
    alertSaved: "勉強記録が保存されました！",
    levelup: "おめでとうございます！レベルアップ！",
    selfStudy: "自習",
    me: "自分",
    send: "送信"
  },
  cn: {
    level: "等级", timetable: "课程表", timeline: "日程表", calendar: "日历",
    timer: "定时器", group: "群组", stats: "统计", settings: "设置",
    logout: "登出",
    lock: "锁定", unlock: "编辑",
    thisWeek: "本周课程",
    addSubject: "添加科目",
    dragToAdd: "将科目拖入格子添加",
    aiAddSchedule: "AI添加日程",
    aiImageScan: "AI课程表识别",
    noTimetable: "还没有课程表",
    noTimetableDesc: "上传图片或从面板拖入格子添加。",
    resetTimetable: "重置课程表",
    pomodoro: "番茄钟", timerMode: "定时器", stopwatch: "秒表",
    start: "开始", pause: "暂停", resume: "继续", stop: "停止",
    focusTime: "专注时间（分钟）", breakTime: "休息时间（分钟）", timerSetting: "定时设置（分钟）",
    clickToEdit: "点击时钟编辑时间",
    studyTimeSetting: "学习时间设置",
    selectRest: "选择休息类型",
    restDesc: "所选休息类型将记录在统计中。",
    meal: "用餐", rest: "休息", sleep: "睡眠", other: "其他",
    customRest: "自定义输入",
    cancel: "取消", save: "保存", confirm: "确认",
    studyGroup: "学习群组",
    joinGroup: "加入学习群组",
    joinGroupDesc: "实时分享学习时间，设置共同目标。",
    enterCode: "输入邀请码（6位）",
    join: "加入",
    createGroup: "创建新群组",
    groupBenefits: "群组学习好处",
    benefit1: "达成目标获得2倍经验！",
    benefit2: "实时查看成员学习状态",
    benefit3: "群组排名和成就系统",
    groupGoalSet: "设置群组目标",
    mathGoal: "数学共同目标（小时）",
    englishGoal: "英语共同目标（小时）",
    memberStatus: "成员实时状态",
    tapForMsg: "点击发送消息",
    studyingNow: "学习中", away: "暂时离开",
    goalProgress: "今日目标进度",
    achieved: "达成！", goalAchievedBonus: "目标完成！2倍经验加成中 🎉",
    leaveGroup: "退出群组",
    leaveGroupConfirm: "确认退出群组？",
    inviteCode: "邀请码:",
    adjustGoal: "修改",
    jointGoal: "共同目标:",
    activeGroup: "进行中·学习群组",
    currentRank: "当前学习等级",
    totalStudy: "累计学习",
    longestFocus: "最长专注",
    studyAnalysis: "学习时间分析",
    daily: "日", weekly: "周", monthly: "月",
    subjectRatio: "科目学习占比",
    totalStudyLabel: "总学习",
    noRecord: "暂无学习记录",
    top3: "重点科目 Top 3",
    noSubjectRecord: "暂无科目记录。",
    restRatio: "休息类型占比",
    achievements: "学习成就",
    profileChange: "修改资料",
    nicknameInput: "输入昵称",
    change: "修改",
    avatarChange: "更换头像",
    themeSettings: "主题设置",
    darkMode: "启用深色模式",
    focusMode: "专注模式",
    allowNotif: "允许部分应用在专注期间通知",
    allowedApps: "选择允许的应用",
    timerOptions: "定时器专注选项",
    flipToFocus: "翻转手机启动定时器",
    notifType: "定时完成提醒方式",
    notifSound: "提示音", notifVibrate: "振动", notifBoth: "提示音+振动",
    languageSettings: "语言设置",
    devTools: "开发者工具",
    subjectManage: "科目管理",
    addCustomSubject: "添加新科目",
    subjectName: "输入科目名称",
    deleteAccount: "注销账户（永久删除）",
    deleteAccountConfirm: "确认注销？所有数据将被永久删除。",
    aiAssistant: "AI 助手",
    aiAsk: "问AI...",
    aiScheduleReg: "AI日程登记",
    aiPlaceholder: "例如：开始数学定时器 / 开始英语番茄钟",
    alertSaved: "学习记录已保存！",
    levelup: "恭喜！等级提升！",
    selfStudy: "自习",
    me: "我",
    send: "发送"
  },
  vi: {
    level: "Cấp", timetable: "T.Khóa Biểu", timeline: "Lịch trình", calendar: "Lịch",
    timer: "Hẹn giờ", group: "Nhóm", stats: "Thống kê", settings: "Cài đặt",
    logout: "Đăng xuất",
    lock: "Khóa", unlock: "Chỉnh sửa",
    thisWeek: "Lịch tuần này",
    addSubject: "Thêm môn học",
    dragToAdd: "Kéo môn học vào ô để thêm",
    aiAddSchedule: "AI thêm lịch",
    aiImageScan: "AI quét thời khóa biểu",
    noTimetable: "Chưa có thời khóa biểu",
    noTimetableDesc: "Tải ảnh lên hoặc kéo từ bảng vào ô.",
    resetTimetable: "Đặt lại thời khóa biểu",
    pomodoro: "Pomodoro", timerMode: "Đặt giờ", stopwatch: "Đồng hồ bấm giờ",
    start: "Bắt đầu", pause: "Tạm dừng", resume: "Tiếp tục", stop: "Dừng",
    focusTime: "Thời gian tập trung (phút)", breakTime: "Thời gian nghỉ (phút)", timerSetting: "Cài đặt hẹn giờ (phút)",
    clickToEdit: "Nhấp vào đồng hồ để chỉnh sửa",
    studyTimeSetting: "Cài đặt thời gian học",
    selectRest: "Bạn muốn nghỉ ngơi gì?",
    restDesc: "Loại nghỉ ngơi được chọn sẽ được ghi lại trong thống kê.",
    meal: "Ăn uống", rest: "Nghỉ ngơi", sleep: "Ngủ", other: "Khác",
    customRest: "Tùy chỉnh",
    cancel: "Hủy", save: "Lưu", confirm: "Xác nhận",
    studyGroup: "Nhóm học",
    joinGroup: "Tham gia nhóm học",
    joinGroupDesc: "Chia sẻ thời gian học thời gian thực và đặt mục tiêu chung.",
    enterCode: "Nhập mã mời (6 ký tự)",
    join: "Tham gia",
    createGroup: "Tạo nhóm mới",
    groupBenefits: "Lợi ích nhóm học",
    benefit1: "EXP x2 khi đạt mục tiêu!",
    benefit2: "Xem trạng thái học tập thời gian thực",
    benefit3: "Xếp hạng và thành tích nhóm",
    groupGoalSet: "Đặt mục tiêu nhóm",
    mathGoal: "Mục tiêu Toán chung (giờ)",
    englishGoal: "Mục tiêu Anh văn chung (giờ)",
    memberStatus: "Trạng thái thành viên",
    tapForMsg: "Nhấn để nhắn tin",
    studyingNow: "Đang học", away: "Vắng mặt",
    goalProgress: "Tiến độ mục tiêu hôm nay",
    achieved: "Đạt!", goalAchievedBonus: "Đạt mục tiêu! EXP x2 đang áp dụng 🎉",
    leaveGroup: "Rời nhóm",
    leaveGroupConfirm: "Bạn có muốn rời nhóm không?",
    inviteCode: "Mã mời:",
    adjustGoal: "Sửa",
    jointGoal: "Mục tiêu chung:",
    activeGroup: "Nhóm học đang hoạt động",
    currentRank: "Cấp độ học tập hiện tại",
    totalStudy: "Tổng thời gian học",
    longestFocus: "Tập trung lâu nhất",
    studyAnalysis: "Phân tích thời gian học",
    daily: "Ngày", weekly: "Tuần", monthly: "Tháng",
    subjectRatio: "Tỉ lệ môn học",
    totalStudyLabel: "Tổng học",
    noRecord: "Chưa có dữ liệu học",
    top3: "Top 3 môn học tập trung",
    noSubjectRecord: "Chưa có dữ liệu theo môn.",
    restRatio: "Tỉ lệ loại nghỉ",
    achievements: "Thành tích học tập",
    profileChange: "Chỉnh sửa hồ sơ",
    nicknameInput: "Nhập biệt danh",
    change: "Thay đổi",
    avatarChange: "Đổi ảnh đại diện",
    themeSettings: "Cài đặt giao diện",
    darkMode: "Bật chế độ tối",
    focusMode: "Chế độ tập trung",
    allowNotif: "Cho phép thông báo một số app khi tập trung",
    allowedApps: "Chọn ứng dụng được phép",
    timerOptions: "Tùy chọn tập trung",
    flipToFocus: "Lật điện thoại để bắt đầu hẹn giờ",
    notifType: "Loại thông báo khi xong",
    notifSound: "Âm thanh", notifVibrate: "Rung", notifBoth: "Âm thanh + Rung",
    languageSettings: "Cài đặt ngôn ngữ",
    devTools: "Công cụ nhà phát triển",
    subjectManage: "Quản lý môn học",
    addCustomSubject: "Thêm môn học mới",
    subjectName: "Nhập tên môn học",
    deleteAccount: "Xóa tài khoản (vĩnh viễn)",
    deleteAccountConfirm: "Xóa tài khoản? Tất cả dữ liệu sẽ bị xóa vĩnh viễn.",
    aiAssistant: "Trợ lý AI",
    aiAsk: "Hỏi AI...",
    aiScheduleReg: "AI đăng ký lịch",
    aiPlaceholder: "Ví dụ: Bắt đầu hẹn giờ Toán / Bắt đầu Pomodoro Anh văn",
    alertSaved: "Đã lưu kết quả học tập!",
    levelup: "Chúc mừng! Bạn đã tăng cấp!",
    selfStudy: "Tự học",
    me: "Tôi",
    send: "Gửi"
  }
};

const DEFAULT_SUBJECTS = ["국어", "영어", "수학", "과학", "사회", "역사", "물리", "화학", "생물", "정보", "체육", "기타"];

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

  const [subjectsList, setSubjectsList] = useState(() => {
    const local = localStorage.getItem("sf_subjects");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return DEFAULT_SUBJECTS;
  });

  const [activeSubject, setActiveSubject] = useState("자율학습");
  const [timerMode, setTimerMode] = useState("pomodoro"); // pomodoro | timer | stopwatch
  const [showAiFabInput, setShowAiFabInput] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [aiFabText, setAiFabText] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState([
    { id: 1, sender: "ai", text: "안녕하세요! StudyFlow AI 비서입니다. 무엇을 도와드릴까요?\n\n💡 아래처럼 말씀해 보세요!\n• \"수학 30분 타이머 작동함\"\n• \"수학 내일 준비물 자\"\n• \"월요일 13시 영어 2시간\"" }
  ]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiChatHistory, showAiFabInput]);

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
      localStorage.setItem("sf_subjects", JSON.stringify(subjectsList));
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
  const handleAiFabSubmit = (overrideText = null) => {
    const text = (typeof overrideText === "string" ? overrideText : aiFabText).trim();
    if (!text) return;

    // 1. Add user message to chat history
    const userMsgId = Date.now();
    setAiChatHistory(prev => [...prev, { id: userMsgId, sender: "user", text }]);

    // 2. Parse using NLP utility
    const parsed = parseNaturalLanguage(text, subjectsList);

    // 3. Process action based on type
    if (parsed.type === "timer") {
      handleStartTimerWithSubject(parsed.subject, parsed.timerMode);
      if (parsed.minutes) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("set-timer-duration", {
            detail: { mode: parsed.timerMode, minutes: parsed.minutes, autoStart: parsed.autoStart }
          }));
        }, 100);
      }
      
      setTimeout(() => {
        setShowAiFabInput(false);
      }, 1500);
    } else if (parsed.type === "memo") {
      setSchedule(prev => {
        const existingIdx = prev.findIndex(item => item.day === parsed.day && item.subject === parsed.subject);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            notes: parsed.memoText
          };
          return updated;
        } else {
          return [...prev, {
            id: Date.now(),
            day: parsed.day,
            startHour: 9,
            duration: 1,
            subject: parsed.subject,
            location: "",
            notes: parsed.memoText
          }];
        }
      });
    } else if (parsed.type === "schedule") {
      const newItem = {
        id: Date.now(),
        day: parsed.day,
        startHour: parsed.startHour,
        duration: parsed.duration,
        subject: parsed.subject,
        location: parsed.location,
        notes: ""
      };
      setSchedule(prev => [...prev, newItem]);
    }

    // 4. Add AI response to chat history with simulated typing delay
    setTimeout(() => {
      setAiChatHistory(prev => [...prev, {
        id: Date.now() + 2,
        sender: "ai",
        text: parsed.responseMessage
      }]);
    }, 400);

    // 5. Reset input text
    if (typeof overrideText !== "string") {
      setAiFabText("");
    }
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
            setSubjectsList={setSubjectsList}
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
            subjectsList={subjectsList}
          />
        )}

        {activeTab === "group" && (
          <Group
            stats={stats || { totalStudyMinutes: 0, longestSessionMinutes: 0, joinedGroup: false, createdGroup: false, completedGroupGoals: 0 }}
            setStats={setStats}
            onJoinGroup={() => setStats(prev => ({ ...(prev || {}), joinedGroup: true }))}
            onCreateGroup={() => setStats(prev => ({ ...(prev || {}), joinedGroup: true, createdGroup: true }))}
            t={t}
            currentUser={user}
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
            subjectsList={subjectsList}
            setSubjectsList={setSubjectsList}
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
            className="ai-fab-container bg-gradient-to-br rounded-full flex items-center overflow-hidden ai-fab-glow"
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
                {t.aiAsk || "AI에게 질문하기..."}
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
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", padding: "16px", paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", color: "var(--primary-color)" }}>
                <span className="material-symbols-outlined material-filled text-primary">auto_awesome</span>
                {t.aiAssistant || "AI 어시스턴트"}
              </span>
              <span className="material-symbols-outlined" onClick={() => setShowAiFabInput(false)} style={{ cursor: "pointer", color: "var(--text-secondary)" }}>close</span>
            </div>
            
            {/* Chat Messages Log */}
            <div 
              ref={chatContainerRef}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "260px",
                minHeight: "180px",
                overflowY: "auto",
                paddingBottom: "12px",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              {aiChatHistory.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                    animation: "fadeIn 0.25s ease"
                  }}
                >
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                    background: msg.sender === "user" 
                      ? "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)" 
                      : "var(--surface-container-high)",
                    color: msg.sender === "user" ? "#ffffff" : "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: "600",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: msg.sender === "user" ? "none" : "1px solid var(--border-color)"
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: "9px", color: "var(--text-disabled)", marginTop: "4px", padding: "0 4px" }}>
                    {msg.sender === "user" ? "나" : "AI 비서"}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggested Quick Chips */}
            <div style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "6px 0",
              marginBottom: "10px",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}>
              {[
                "수학 30분 타이머 작동함",
                "수학 내일 준비물 자",
                "월요일 13시 영어 2시간"
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleAiFabSubmit(chip)}
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "var(--primary-color)",
                    background: "rgba(36,56,156,0.06)",
                    border: "1px solid rgba(36,56,156,0.12)",
                    borderRadius: "20px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    outline: "none"
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
            
            {/* Input Form */}
            <form
              onSubmit={e => { e.preventDefault(); handleAiFabSubmit(); }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                className="input-field"
                placeholder={t.aiPlaceholder || "예: 수학 타이머 시작 / 영어 뽀모도로 시작"}
                value={aiFabText}
                onChange={e => setAiFabText(e.target.value)}
                style={{ flex: 1, fontSize: "13px" }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "auto", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>send</span>
              </button>
            </form>
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
