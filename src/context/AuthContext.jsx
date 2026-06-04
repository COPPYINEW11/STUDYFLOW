/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("구글 로그인에 실패했습니다. Firebase 콘솔에서 구글 로그인이 활성화되어 있는지 확인해 주세요. 우측 하단의 [게스트 로그인] 버튼을 통해 오프라인으로 접속하실 수 있습니다.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    setUser({
      uid: "guest-user-123",
      displayName: "김주환",
      email: "guest@fcaid.app",
      photoURL: null,
      isGuest: true
    });
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user?.isGuest) {
        setUser(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginWithGoogle, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
