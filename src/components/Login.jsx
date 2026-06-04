import { useAuth } from "../context/AuthContext";
import { BookOpen, LogIn, Award, Users, Compass } from "lucide-react";

export const Login = () => {
  const { loginWithGoogle, loginAsGuest } = useAuth();

  return (
    <div className="intro-container">
      <div style={{ marginBottom: "40px", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)",
            padding: "16px",
            borderRadius: "20px",
            boxShadow: "var(--shadow-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Compass size={48} color="#ffffff" style={{ animation: "spin 20s linear infinite" }} />
          </div>
        </div>
        <h1 className="intro-logo">FCAID</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "500" }}>
          Transform your chaos into a rhythmic study flow
        </p>
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        marginBottom: "60px",
        textAlign: "left"
      }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ color: "var(--primary-color)" }}><BookOpen size={20} /></div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700" }}>AI-Powered Timetable</h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Create timetables automatically using images or text.</p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ color: "var(--secondary-color)" }}><Award size={20} /></div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700" }}>Gamified Motivation</h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Earn experiences, level up, and unlock achievements.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ color: "var(--accent-color)" }}><Users size={20} /></div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700" }}>Cooperative Study Groups</h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Share your focus hours with code invitations and double your EXP.</p>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", marginTop: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button className="btn btn-primary" onClick={loginWithGoogle}>
          <LogIn size={18} />
          Google 계정으로 시작하기
        </button>
        <button className="btn btn-secondary" onClick={loginAsGuest}>
          게스트로 로그인 (오프라인 테스트)
        </button>
      </div>
      
      <p style={{ fontSize: "11px", color: "var(--text-disabled)" }}>
        By continuing, you agree to our Terms and Service.
      </p>
    </div>
  );
};
