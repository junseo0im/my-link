"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { dummyLinks } from "../data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// 브랜드 고유 로고 SVG 및 맞춤 테마 컬러 바인딩 컴포넌트
const BrandIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case "instagram":
      return (
        <svg
          className="h-5 w-5 text-pink-500 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case "youtube":
      return (
        <svg
          className="h-5 w-5 text-red-500 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      );
    case "blog":
      return (
        // 네이버 블로그 시그니처 초록색 브랜드 N 심볼
        <svg
          className="h-4.5 w-4.5 text-emerald-500 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16.2 2H7.8C4.6 2 2 4.6 2 7.8v8.4C2 19.4 4.6 22 7.8 22h8.4c3.2 0 5.8-2.6 5.8-5.8V7.8C22 4.6 19.4 2 16.2 2zm-1.8 14.6H12v-5.2l-3 5.2H6.6V7.4h2.4v5.2l3-5.2h2.4v9.2z" />
        </svg>
      );
    case "github":
      return (
        <svg
          className="h-5 w-5 text-slate-100 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      );
    case "portfolio":
      return (
        <svg
          className="h-5 w-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
    default:
      return <Icons.Link2 className="h-5 w-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />;
  }
};

export default function LandingPage() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-slate-100 antialiased font-sans">
      
      {/* 1. 우측 상단 공유/복사 플로팅 버튼 위젯 */}
      <div className="absolute right-6 top-6 z-10">
        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-300 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-indigo-500/50 hover:bg-slate-900 hover:text-indigo-400 active:scale-95"
          title="마이링크 주소 복사"
        >
          {copied ? (
            <Icons.Check className="h-5 w-5 animate-in fade-in zoom-in duration-200" />
          ) : (
            <Icons.Share2 className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
          )}
        </button>
        {copied && (
          <span className="absolute -bottom-9 right-0 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-650 animate-in slide-in-from-top-2 duration-200">
            링크 복사 완료!
          </span>
        )}
      </div>

      {/* 2. 중앙 프로필 카드 컨테이너 */}
      <div className="flex w-full max-w-md flex-col items-center space-y-8">
        
        {/* 2.1 프로필 헤더 정보 (아바타, 닉네임, bio) */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <Avatar className="h-24 w-24 border-2 border-indigo-500/30 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-950/50 ring-4 ring-slate-950/60 transition-transform duration-500 hover:rotate-6">
            <AvatarFallback className="bg-transparent text-3xl font-extrabold tracking-wider text-slate-100">
              임
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200">
              임준서
            </h1>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-400">
              AI 엔지니어 | 인공지능 서비스 및 LLM 에이전트 아키텍처 설계
            </p>
          </div>
        </div>

        {/* 2.2 실물 링크 리스트 카드 섹션 */}
        <div className="w-full space-y-4">
          {dummyLinks.map((link) => {
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
              >
                <Card className="overflow-hidden border border-slate-800/80 bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/50 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-indigo-950/20 active:scale-[0.99] group">
                  <CardContent className="flex items-center p-4">
                    
                    {/* 좌측 브랜드 시그니처 아이콘 로딩 */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/50 border border-slate-800 transition-colors duration-300 group-hover:bg-indigo-950/20">
                      <BrandIcon name={link.icon || ""} />
                    </div>

                    {/* 중앙 타이틀 */}
                    <div className="ml-4 flex-grow text-left">
                      <span className="text-sm font-bold tracking-wide text-slate-200 transition-colors duration-300 group-hover:text-white">
                        {link.title}
                      </span>
                    </div>

                    {/* 우측 방향 지시 화살표 */}
                    <div className="text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-300">
                      <Icons.ChevronRight className="h-5 w-5" />
                    </div>

                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* 2.3 마이링크 브랜드 푸터 */}
        <footer className="pt-4 text-center">
          <a
            href="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase transition-colors duration-300 hover:text-indigo-400"
          >
            <Icons.Sparkles className="h-3.5 w-3.5" />
            <span>Made by MyLink</span>
          </a>
        </footer>

      </div>
    </main>
  );
}
