"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { dummyLinks, LinkItem } from "../../data/links";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// 브랜드 아이콘 렌더링 헬퍼 (page.tsx와 동일하게 바인딩하여 일관성 유지)
const BrandIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case "instagram":
      return <svg className="h-5 w-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    case "youtube":
      return <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
    case "blog":
      return <svg className="h-4.5 w-4.5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M16.2 2H7.8C4.6 2 2 4.6 2 7.8v8.4C2 19.4 4.6 22 7.8 22h8.4c3.2 0 5.8-2.6 5.8-5.8V7.8C22 4.6 19.4 2 16.2 2zm-1.8 14.6H12v-5.2l-3 5.2H6.6V7.4h2.4v5.2l3-5.2h2.4v9.2z" /></svg>;
    case "github":
      return <svg className="h-5 w-5 text-slate-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
    case "portfolio":
      return <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
    default:
      return <Icons.Link2 className="h-5 w-5 text-indigo-400" />;
  }
};

export default function MyPage() {
  const [links, setLinks] = useState<LinkItem[]>(dummyLinks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  // 새 링크 등록 제출 핸들러 (동작 순서: 1. 입력값 가져오기 -> 2. 검증 -> 3. 목록 추가)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. 제목/주소 가져오기
    const inputTitle = title.trim();
    const inputUrl = url.trim();

    // 2. 검증 (빈 칸 체크 & 주소 형식 체크)
    if (!inputTitle) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!inputUrl) {
      setError("주소를 입력해주세요");
      return;
    }

    // 간단한 URL 주소 형식 체크 정규식
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!urlPattern.test(inputUrl)) {
      setError("올바른 주소를 입력해주세요");
      return;
    }

    // 3. 검증 통과 시 목록에 추가
    // 프로토콜(http/https) 누락 시 자동으로 https:// 결합
    let formattedUrl = inputUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // 도메인을 분석하여 해당 브랜드 명칭에 맞춰 자동 아이콘 태그 부여
    let detectedIcon = "link";
    const lowerUrl = formattedUrl.toLowerCase();
    if (lowerUrl.includes("instagram.com")) detectedIcon = "instagram";
    else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) detectedIcon = "youtube";
    else if (lowerUrl.includes("github.com")) detectedIcon = "github";
    else if (lowerUrl.includes("blog.naver.com") || lowerUrl.includes("tistory.com") || lowerUrl.includes("blog")) detectedIcon = "blog";
    else if (lowerUrl.includes("portfolio") || lowerUrl.includes("resume")) detectedIcon = "portfolio";

    const newLink: LinkItem = {
      id: `link-${Date.now()}`,
      title: inputTitle,
      url: formattedUrl,
      icon: detectedIcon,
    };

    setLinks([...links, newLink]);
    setTitle("");
    setUrl("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-slate-100 antialiased font-sans">
      <div className="w-full max-w-md flex flex-col space-y-10">
        
        {/* 1. 상단: 대시보드 제목 및 브랜딩 */}
        <header className="flex flex-col items-center text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-[#5B5FC7] shadow-lg shadow-indigo-950/50">
            <Icons.Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200">
              마이페이지
            </h1>
            <p className="text-sm font-semibold tracking-wider text-[#5B5FC7] uppercase">
              실시간 링크 관리 대시보드
            </p>
          </div>
        </header>

        {/* 2. 중간: 링크 추가 폼 (Card 활용) */}
        <Card className="border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl shadow-slate-950/40 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-200">새로운 링크 생성</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              방문자들에게 노출될 매력적인 링크 버튼을 생성합니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              
              {/* 제목 입력 필드 (세로 배치) */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                  1. 링크 제목
                </label>
                <div className="relative flex items-center">
                  <Icons.Type className="absolute left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 공식 인스타그램 바로가기"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* 주소 입력 필드 (세로 배치) */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                  2. 이동할 URL 주소
                </label>
                <div className="relative flex items-center">
                  <Icons.Globe className="absolute left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="예: instagram.com/username"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* 유효성 경고 에러 메시지 */}
              {error && (
                <div className="flex items-center space-x-2 text-xs font-semibold text-rose-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Icons.AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 추가 버튼 (보라색 #5B5FC7 고수) */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#5B5FC7] py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:bg-[#4b4fad] hover:shadow-indigo-650/20 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Icons.PlusCircle className="h-4.5 w-4.5" />
                <span>링크 카드 추가하기</span>
              </button>

            </form>
          </CardContent>
        </Card>

        {/* 3. 하단: 실시간 링크 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
              실시간 노출 목록 ({links.length})
            </span>
            <a
              href="/"
              className="text-xs font-bold text-[#5B5FC7] hover:underline flex items-center space-x-1"
            >
              <span>랜딩 페이지 미리보기</span>
              <Icons.ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5B5FC7] rounded-xl animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-slate-700/80 hover:bg-slate-900/40 group">
                  
                  <div className="flex items-center min-w-0">
                    {/* 브랜드 아이콘 */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950/40 border border-slate-800">
                      <BrandIcon name={link.icon || ""} />
                    </div>
                    {/* 링크 정보 */}
                    <div className="ml-3 min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                        {link.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {link.url}
                      </p>
                    </div>
                  </div>

                  {/* 새창 이동 화살표 */}
                  <div className="text-slate-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-slate-400">
                    <Icons.ChevronRight className="h-4 w-4" />
                  </div>

                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
