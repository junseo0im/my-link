"use client";

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { db } from "../lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  updateDoc,
  increment 
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../components/auth-provider";
import { LinkItem } from "../data/links";

// 핵심 역량 카드 컴포넌트 (Aesthetics)
const ExpertiseCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-800/80 bg-slate-900/35 backdrop-blur-md transition-all duration-350 hover:scale-[1.03] hover:border-indigo-500/50 hover:bg-slate-900/50 hover:shadow-xl hover:shadow-indigo-950/20 group text-left">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[#5B5FC7] mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-100 mb-1.5 transition-colors duration-300 group-hover:text-indigo-400">
        {title}
      </h3>
      <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
        {description}
      </p>
    </div>
  );
};

// 브랜드 고유 로고 SVG 및 맞춤 테마 컬러 바인딩 컴포넌트
const BrandIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case "instagram":
      return <svg className="h-4.5 w-4.5 text-pink-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    case "youtube":
      return <svg className="h-4.5 w-4.5 text-red-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
    case "blog":
      return <svg className="h-4.5 w-4.5 text-emerald-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M16.2 2H7.8C4.6 2 2 4.6 2 7.8v8.4C2 19.4 4.6 22 7.8 22h8.4c3.2 0 5.8-2.6 5.8-5.8V7.8C22 4.6 19.4 2 16.2 2zm-1.8 14.6H12v-5.2l-3 5.2H6.6V7.4h2.4v5.2l3-5.2h2.4v9.2z" /></svg>;
    case "github":
      return <svg className="h-4.5 w-4.5 text-slate-100 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
    case "portfolio":
      return <svg className="h-4.5 w-4.5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
    default:
      return <Icons.Link2 className="h-4.5 w-4.5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />;
  }
};

export default function PersonalPortfolioLanding() {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 1. 임준서 본인의 메인 랜드 카드 데이터로 Firestore 'users/anonymous/links' 실시간 동적 바인딩
  useEffect(() => {
    const linksCollectionRef = collection(db, "users", "anonymous", "links");
    const linksQuery = query(linksCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(linksQuery, (snapshot) => {
      const dbLinks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];
      
      setLinks(dbLinks);
      setLoading(false);
    }, (err) => {
      console.error("데모 프로필 로드 실패:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. 실물 연동형 목업 내 클릭 카운팅 헬퍼 (increment 원자적 처리 및 콘솔 로깅 완벽 탑재)
  const handleLinkClick = async (linkId: string) => {
    try {
      const linkDocRef = doc(db, "users", "anonymous", "links", linkId);
      await updateDoc(linkDocRef, {
        clickCount: increment(1)
      });
    } catch (err) {
      console.error("클릭 카운트 로깅 실패:", err);
    }
  };

  // 내 프로필 주소 공유 복사
  const handleShareProfile = async () => {
    try {
      const profileUrl = `${window.location.origin}/im`;
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 antialiased font-sans">
      
      {/* 1. 히어로 섹션 (Hero Section - 임준서 개인 브랜딩 홈화면) */}
      <section className="flex flex-col items-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/30 text-indigo-400 text-[10px] font-extrabold tracking-wider uppercase animate-bounce">
          <Icons.Sparkles className="h-3.5 w-3.5" />
          <span>AI ENGINEER & FULL-STACK PORTFOLIO</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-150 to-indigo-200">
          임준서의 <span className="text-[#5B5FC7]">MyLink</span>에 오신 것을 환영합니다
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto font-medium">
          인공지능 LLM 에이전트 아키텍처를 연구 설계하고, Next.js와 Firestore 서버리스 스택을 결합한 세련된 풀스택 웹 서비스를 구현합니다. 저의 활동 채널과 프로젝트 성과를 아래 모바일 프로필 카드를 통해 실시간으로 조작해 보세요.
        </p>

        {/* CTA 버튼 콤보 (관리자 대시보드 바로가기 연동) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full max-w-md">
          <Link href="/mypage" className="w-full sm:w-auto">
            <button className="w-full sm:px-8 py-3 rounded-xl bg-[#5B5FC7] text-xs font-extrabold text-white shadow-xl shadow-indigo-950/40 hover:bg-[#4b4fad] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2">
              <Icons.LockOpen className="h-4 w-4" />
              <span>관리자 페이지 (대시보드)</span>
            </button>
          </Link>
          <a href="#preview" className="w-full sm:w-auto">
            <button className="w-full sm:px-8 py-3 rounded-xl border border-slate-800 bg-slate-900/40 text-xs font-extrabold text-slate-350 hover:bg-slate-950 hover:text-slate-100 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5">
              <span>내 프로필 카드 작동 확인</span>
              <Icons.ArrowDown className="h-3.5 w-3.5" />
            </button>
          </a>
        </div>
      </section>

      {/* 2. 전문 역량 섹션 (Expertise Section - 임준서의 3대 핵심 역량 소개) */}
      <section className="px-4 py-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-xs font-extrabold tracking-wider text-[#5B5FC7] uppercase">핵심 전문성</h2>
          <p className="text-lg font-bold text-slate-200">인공지능 에이전트와 웹 엔지니어링의 융합</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExpertiseCard
            icon={<Icons.Cpu className="h-5 w-5" />}
            title="AI & LLM 에이전트 설계"
            description="대규모 언어 모델(LLM)을 활용한 다중 에이전트 자율 워크플로우를 연구하고, pair programming 에이전트 기술 및 RAG 검색 파이프라인 아키텍처를 최적화합니다."
          />
          <ExpertiseCard
            icon={<Icons.Code2 className="h-5 w-5" />}
            title="프리미엄 풀스택 개발"
            description="Next.js App Router, React 19, TypeScript 및 Tailwind 4를 결합하여, 유려한 애니메이션과 반응성이 돋보이는 모바일/데스크톱 하이엔드 웹 애플리케이션을 기획 구현합니다."
          />
          <ExpertiseCard
            icon={<Icons.ChartArea className="h-5 w-5" />}
            title="데이터 흐름 및 성과 추적"
            description="Firestore 서버리스 환경에서의 Atomic 카운팅 전송 및 실시간 성과 대시보드 구조를 연동하여, 방문객의 클릭 점유율 지표를 시각 게이지 바 차트로 분석 추적합니다."
          />
        </div>
      </section>

      {/* 3. 스마트폰 모형 실물 연동 미리보기 섹션 (Preview Section) */}
      <section id="preview" className="px-4 py-12 max-w-3xl mx-auto w-full flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-xs font-extrabold tracking-wider text-[#5B5FC7] uppercase">작동 예시</h2>
          <p className="text-lg font-bold text-slate-200">실시간 Firestore 연동형 스마트폰 프로필 목업</p>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto">목업 내의 링크를 클릭하면 실제로 새 탭으로 연결되며 클릭수가 집계됩니다!</p>
        </div>

        {/* 모바일 폰 프레임 목업 (Aesthetics) */}
        <div className="relative w-full max-w-[290px] aspect-[9/18.5] rounded-[42px] border-8 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden shadow-indigo-950/40 flex flex-col group hover:border-[#5B5FC7] transition-colors duration-500">
          {/* 노치 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-xl z-20" />
          
          {/* 내부 카드 실시간 렌더링 프레임 */}
          <div className="flex-grow flex flex-col bg-gradient-to-b from-slate-900 to-indigo-950 p-4 text-center pt-9 justify-between min-h-0 overflow-y-auto">
            
            {/* 프로필 정보 */}
            <div className="flex flex-col items-center space-y-3.5 pt-2">
              <Avatar className="h-14 w-14 border border-slate-700 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow shadow-indigo-950">
                <AvatarFallback className="text-base font-extrabold text-white">임</AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white">임준서</h4>
                <p className="text-[9px] text-[#5B5FC7] font-bold">@im</p>
                <p className="text-[8px] leading-relaxed text-slate-400 max-w-[170px] mx-auto font-medium">
                  AI 엔지니어 | 인공지능 서비스 및 LLM 에이전트 아키텍처 설계
                </p>
              </div>
            </div>

            {/* 실시간 렌더링 카드 리스트 */}
            <div className="w-full space-y-2 my-auto max-h-[190px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex flex-col space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-9 w-full rounded-xl bg-slate-800/40 animate-pulse border border-slate-800/30" />
                  ))}
                </div>
              ) : links.length === 0 ? (
                <p className="text-[8px] text-slate-500">등록된 링크 카드가 없습니다.</p>
              ) : (
                links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link.id)}
                    className="block w-full focus:outline-none"
                  >
                    <div className="w-full p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm flex items-center justify-between text-[9px] font-bold text-slate-350 hover:bg-slate-950 hover:text-white transition-all duration-200">
                      <span className="flex items-center space-x-1.5 truncate min-w-0 pr-1">
                        <BrandIcon name={link.icon || ""} />
                        <span className="truncate">{link.title}</span>
                      </span>
                      <Icons.ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* 메이드 바이 푸터 */}
            <span className="text-[7px] text-slate-550 font-bold uppercase tracking-wider block py-1.5 border-t border-slate-850">
              ✦ Made by MyLink
            </span>
          </div>

          {/* 목업 호버 복사 안내 위젯 */}
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm z-10">
            <span className="text-[10px] font-extrabold text-[#5B5FC7] uppercase tracking-wider mb-2">내 공유용 프로필</span>
            <button
              onClick={handleShareProfile}
              className="px-4 py-2 rounded-lg bg-[#5B5FC7] text-[9px] font-black text-white cursor-pointer active:scale-95 transition-transform"
            >
              {copied ? "주소 복사 완료!" : "공유 주소 복사하기"}
            </button>
          </div>
        </div>

        {/* 내 관리자용 대시보드 바로가기 */}
        <Link href="/mypage" className="pt-2">
          <button className="rounded-xl bg-[#5B5FC7] px-8 py-3 text-xs font-extrabold text-white shadow-xl shadow-indigo-950/40 hover:bg-[#4b4fad] cursor-pointer flex items-center space-x-1.5">
            <span>내 마이링크 대시보드 가기</span>
            <Icons.ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </section>

      {/* 4. 푸터 영역 (임준서 퍼스널 크레딧) */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-10 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-slate-100">
              <Icons.Sparkles className="h-4.5 w-4.5 text-indigo-500" />
              <span className="font-extrabold tracking-wider text-xs">MyLink</span>
            </div>
            <p className="text-[10px] font-bold text-indigo-400/90 tracking-wide">
              임준서 (Junseo Im) | 한양대학교 바이브 코딩
            </p>
          </div>

          <p className="text-[9px] font-medium text-slate-650 tracking-wider">
            &copy; 2026 Junseo Im. All rights reserved. Powered by Google Gemini DeepMind.
          </p>

          {/* 깃허브 개인 연동 */}
          <a
            href="https://github.com/junseo0im/my-link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-450 hover:border-slate-700 hover:bg-slate-950 hover:text-white active:scale-90 transition-all duration-200"
            title="GitHub 저장소 바로가기"
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
