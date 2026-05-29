"use client";

import React from "react";
import { useAuth } from "./auth-provider";
import Link from "next/link";
import * as Icons from "lucide-react";

export default function Header() {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-md h-16 items-center justify-between px-4">
        
        {/* 좌측 로고 영역 */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-slate-100 hover:text-indigo-400 transition-colors duration-300 group"
        >
          <Icons.Sparkles className="h-4.5 w-4.5 text-indigo-500 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
          <span className="font-extrabold tracking-wider text-xs sm:text-sm bg-clip-text bg-gradient-to-r from-slate-50 to-indigo-200">
            MyLink
          </span>
        </Link>

        {/* 우측 네비게이션 & 로그인 컨트롤 */}
        <div className="flex items-center space-x-3">
          <Link 
            href="/mypage" 
            className="text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors duration-300 flex items-center space-x-1"
          >
            <Icons.Layers className="h-3.5 w-3.5 text-indigo-450" />
            <span>마이페이지</span>
          </Link>
          
          <div className="h-3 w-px bg-slate-800" />

          {loading ? (
            // 세션 데이터 로딩 중 펄스 스켈레톤 가드
            <div className="h-7 w-20 rounded-lg bg-slate-900 animate-pulse border border-slate-800/40" />
          ) : user ? (
            // 2. 로그인 완료 상태
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-300 max-w-[70px] sm:max-w-[100px] truncate" title={user.displayName || "사용자"}>
                {user.displayName || "사용자"}님
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-800/80 bg-slate-900/40 px-2 py-1 text-[10px] font-extrabold text-slate-400 hover:border-rose-500/45 hover:bg-rose-950/20 hover:text-rose-400 active:scale-95 transition-all duration-200 cursor-pointer"
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
          ) : (
            // 1. 로그아웃 상태 (Google 로그인 유도)
            <button
              onClick={loginWithGoogle}
              className="flex items-center space-x-1 rounded-lg bg-[#5B5FC7] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md shadow-indigo-950/40 hover:bg-[#4b4fad] hover:shadow-indigo-650/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="h-2.5 w-2.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.883-6.435-6.437 0-3.553 2.88-6.436 6.435-6.436 1.63 0 3.125.614 4.254 1.62l3.122-3.12A11.91 11.91 0 0012.24 2C6.583 2 2 6.584 2 12.24c0 5.657 4.583 10.24 10.24 10.24 5.795 0 10.24-4.117 10.24-10.24 0-.693-.06-1.362-.176-1.955H12.24z" />
              </svg>
              <span>로그인</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
