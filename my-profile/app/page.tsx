"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { useAuth } from "../components/auth-provider";

// 기능 카드 개별 컴포넌트 (Aesthetics)
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-md transition-all duration-350 hover:scale-[1.03] hover:border-indigo-500/50 hover:bg-slate-900/50 hover:shadow-xl hover:shadow-indigo-950/20 group">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[#5B5FC7] mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-100 mb-1.5 transition-colors duration-300 group-hover:text-indigo-400">
        {title}
      </h3>
      <p className="text-[11px] leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
};

export default function MarketingLandingPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // 미리보기용 목업 계정 주소 복사 시뮬레이션
  const handleCopyDemo = async () => {
    try {
      const demoUrl = `${window.location.origin}/im`;
      await navigator.clipboard.writeText(demoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 antialiased font-sans">
      
      {/* 1. 히어로 섹션 (Hero Section) */}
      <section className="flex flex-col items-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 max-w-3xl mx-auto space-y-6">
        {/* 브랜딩 뱃지 */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/30 text-indigo-400 text-[10px] font-extrabold tracking-wider uppercase animate-bounce">
          <Icons.Sparkles className="h-3.5 w-3.5" />
          <span>단 하나의 링크로 나를 브랜딩하세요</span>
        </div>
        
        {/* 서비스 이름 및 메인 헤드라인 */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-150 to-indigo-200">
          흩어진 나의 모든 발자국,<br className="sm:hidden" /> <span className="text-[#5B5FC7]">MyLink</span>에 담다.
        </h1>

        {/* 태그라인 */}
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto font-medium">
          퍼스널 포트폴리오, 인스타그램, 깃허브, 블로그까지. 복잡한 플랫폼 주소들을 우아한 단 하나의 고유 프로필 주소로 요약하고, 실시간 방문 성과를 무료로 추적해 보세요.
        </p>

        {/* 메인 CTA 버튼 콤보 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full max-w-md">
          <Link href="/mypage" className="w-full sm:w-auto">
            <button className="w-full sm:px-8 py-3 rounded-xl bg-[#5B5FC7] text-xs font-extrabold text-white shadow-xl shadow-indigo-950/40 hover:bg-[#4b4fad] hover:shadow-indigo-650/20 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2">
              <Icons.PlusCircle className="h-4.5 w-4.5" />
              <span>지금 무료로 시작하기</span>
            </button>
          </Link>
          <a href="#preview" className="w-full sm:w-auto">
            <button className="w-full sm:px-8 py-3 rounded-xl border border-slate-800 bg-slate-900/40 text-xs font-extrabold text-slate-350 hover:bg-slate-950 hover:text-slate-100 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5">
              <span>미리보기 체험</span>
              <Icons.ArrowDown className="h-3.5 w-3.5" />
            </button>
          </a>
        </div>
      </section>

      {/* 2. 기능 소개 카드 섹션 (3대 기능) */}
      <section className="px-4 py-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-xs font-extrabold tracking-wider text-[#5B5FC7] uppercase">주요 핵심 기능</h2>
          <p className="text-lg font-bold text-slate-200">심플하면서도 완벽하게 지원하는 프로필 링크 서비스</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Icons.Layers className="h-5 w-5" />}
            title="직관적인 카드식 링크 관리"
            description="인스타그램, 유튜브, 네이버 블로그 등 주요 브랜드 채널을 감지하여 미학적인 카드 컴포넌트로 자동 시각화 및 무제한 CRUD를 지원합니다."
          />
          <FeatureCard
            icon={<Icons.ChartNoAxesColumnIncreasing className="h-5 w-5" />}
            title="실시간 원자적 클릭 분석"
            description="방문자가 어떤 링크에 가장 열광하는지 실시간 누계 클릭수를 합산하고, 점유율 게이지 막대와 내림차순 랭킹 목록으로 즉각 제공합니다."
          />
          <FeatureCard
            icon={<Icons.Link className="h-5 w-5" />}
            title="나만의 고유 username URL"
            description="?uid= 형태의 무작위 ID를 탈피하여, /username 형태의 럭셔리하고 직관적인 전용 오픈 주소를 발급받아 마케팅 가치를 부여합니다."
          />
        </div>
      </section>

      {/* 3. 목업 미리보기 섹션 (Preview Section) */}
      <section id="preview" className="px-4 py-12 max-w-3xl mx-auto w-full flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-xs font-extrabold tracking-wider text-[#5B5FC7] uppercase">미리보기 목업</h2>
          <p className="text-lg font-bold text-slate-200">실시간 연동되는 모바일 최적화 프로필 카드</p>
        </div>

        {/* 모바일 폰 3D 모형 형태의 목업 프레임 구현 (Aesthetics) */}
        <div className="relative w-full max-w-[280px] aspect-[9/18.5] rounded-[40px] border-8 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden shadow-indigo-950/40 flex flex-col group hover:border-[#5B5FC7] transition-colors duration-500">
          {/* 노치 모형 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-b-xl z-20" />
          
          {/* 내부 작동 시뮬레이션 프레임 (데모 상태 렌더링) */}
          <div className="flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-indigo-950 p-4 text-center space-y-4 pt-8">
            {/* 프로필 이미지 */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-slate-700 shadow flex items-center justify-center text-lg font-black text-white">
              임
            </div>
            
            {/* 이름 및 아이디 */}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">임준서</h4>
              <p className="text-[9px] text-[#5B5FC7] font-semibold">@im</p>
              <p className="text-[8px] text-slate-400 max-w-[150px] leading-relaxed mx-auto">AI 엔지니어 | 인공지능 서비스 및 LLM 에이전트 아키텍처 설계</p>
            </div>

            {/* 카드 리스트 더미 미리보기 */}
            <div className="w-full space-y-1.5 pt-2">
              <div className="w-full p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-[9px] font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <svg className="h-3.5 w-3.5 text-slate-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  <span>공식 깃허브 (GitHub)</span>
                </span>
                <Icons.ChevronRight className="h-3 w-3 text-slate-600" />
              </div>
              <div className="w-full p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-[9px] font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <svg className="h-3.5 w-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  <span>공식 인스타그램</span>
                </span>
                <Icons.ChevronRight className="h-3 w-3 text-slate-600" />
              </div>
            </div>

            {/* 브랜드 푸터 */}
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider pt-2 block">
              ✦ Made by MyLink
            </span>
          </div>

          {/* 목업 클릭 유도 복사 위젯 */}
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-350 backdrop-blur-sm z-10">
            <span className="text-[10px] font-extrabold text-[#5B5FC7] uppercase tracking-wider mb-2">실물 랜딩 카드 미리보기</span>
            <button
              onClick={handleCopyDemo}
              className="px-4 py-2 rounded-lg bg-[#5B5FC7] text-[9px] font-black text-white cursor-pointer active:scale-95 transition-transform"
            >
              {copied ? "주소 복사 완료!" : "공유 주소 복사하기"}
            </button>
          </div>
        </div>

        {/* 미리보기 하단 CTA 추가 진입 */}
        <Link href="/mypage" className="pt-2">
          <button className="rounded-xl bg-[#5B5FC7] px-8 py-3 text-xs font-extrabold text-white shadow-xl shadow-indigo-950/40 hover:bg-[#4b4fad] cursor-pointer flex items-center space-x-1.5">
            <span>나만의 랜딩 카드 만들기</span>
            <Icons.ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </section>

      {/* 4. 푸터 영역 (Footer Section - 한양대학교 바이브 코딩 및 GitHub 연동) */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-10 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          {/* 브랜딩 크레딧 로고 */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-slate-100">
              <Icons.Sparkles className="h-4.5 w-4.5 text-indigo-500" />
              <span className="font-extrabold tracking-wider text-xs">MyLink</span>
            </div>
            <p className="text-[10px] font-bold text-indigo-400/90 tracking-wide">
              한양대학교 바이브 코딩 (Hanyang Vibe Coding)
            </p>
          </div>

          {/* 카피라이트 */}
          <p className="text-[9px] font-medium text-slate-650 tracking-wider">
            &copy; 2026 MyLink. All rights reserved. Developed with Google Gemini DeepMind Team.
          </p>

          {/* 깃허브 공식 소스코드 아이콘 링크 (새 탭 연동) */}
          <a
            href="https://github.com/junseo0im/my-link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-450 hover:border-slate-700 hover:bg-slate-950 hover:text-white active:scale-90 transition-all duration-200"
            title="GitHub 공식 저장소 바로가기"
          >
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
          </a>
        </div>
      </footer>

    </main>
  );
}
