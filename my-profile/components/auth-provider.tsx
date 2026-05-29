"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // onAuthStateChanged 리스너로 세션 변화 실시간 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 로그인 성공 시 프로필 데이터 자동 초기 설정 체크
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists() || !userDocSnap.data()?.profile) {
            // 1. 기본 username 파싱 (안전한 영문/숫자/언더바 포맷 적용)
            let baseUsername = currentUser.email 
              ? currentUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
              : "user_" + Math.floor(1000 + Math.random() * 9000);
            
            if (!baseUsername) {
              baseUsername = "user_" + Math.floor(1000 + Math.random() * 9000);
            }

            // 2. username 중복 체크 및 자동 보정
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("profile.username", "==", baseUsername));
            const querySnapshot = await getDocs(q);

            let finalUsername = baseUsername;
            if (!querySnapshot.empty) {
              // 중복 발견 시 고유한 4자리 난수 덧붙임
              finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            // 3. Firestore에 자동 초기 프로필 적재
            const initialProfile = {
              username: finalUsername,
              displayName: currentUser.displayName || "사용자",
              bio: "MyLink 프로필 카드에 오신 것을 환영합니다. 소개글을 편집해 보세요."
            };

            await setDoc(userDocRef, { profile: initialProfile }, { merge: true });
          }
        } catch (err) {
          console.error("인증 직후 프로필 초기 셋업 실패:", err);
        }
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google 소셜 로그인 에러:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
