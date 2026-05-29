"use client";

import React, { useState, useEffect, use } from "react";
import * as Icons from "lucide-react";
import { LinkItem } from "../../data/links";
import { db } from "../../lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs, 
  where,
  doc,
  updateDoc,
  increment 
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

// 브랜드 고유 로고 SVG 및 맞춤 테마 컬러 바인딩 컴포넌트
const BrandIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case "instagram":
      return <svg className="h-5 w-5 text-pink-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    case "youtube":
      return <svg className="h-5 w-5 text-red-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
    case "blog":
      return <svg className="h-4.5 w-4.5 text-emerald-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M16.2 2H7.8C4.6 2 2 4.6 2 7.8v8.4C2 19.4 4.6 22 7.8 22h8.4c3.2 0 5.8-2.6 5.8-5.8V7.8C22 4.6 19.4 2 16.2 2zm-1.8 14.6H12v-5.2l-3 5.2H6.6V7.4h2.4v5.2l3-5.2h2.4v9.2z" /></svg>;
    case "github":
      return <svg className="h-5 w-5 text-slate-100 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
    case "portfolio":
      return <svg className="h-5 w-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
    default:
      return <Icons.Link2 className="h-5 w-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />;
  }
};

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  // 1. Next.js 16/React 19 동적 매개변수 비동기 언래핑
  const resolvedParams = use(params);
  const targetUsername = resolvedParams.username.toLowerCase();

  const [targetUid, setTargetUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ displayName: string; bio: string; username: string } | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  
  const [userLoading, setUserLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(true);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  // 2. Firestore profile.username == targetUsername 인 사용자 조회 및 UID 탐색
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("profile.username", "==", targetUsername));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          let foundUid = "";
          let foundProfile = null;
          querySnapshot.forEach((doc) => {
            foundUid = doc.id;
            foundProfile = doc.data().profile;
          });

          setTargetUid(foundUid);
          setProfile(foundProfile);
          setUserExists(true);
        } else {
          setUserExists(false);
        }
      } catch (err) {
        console.error("동적 사용자 조회 에러:", err);
        setUserExists(false);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [targetUsername]);

  // 3. 탐색된 사용자의 links 서브컬렉션을 최신순 실시간 구독(onSnapshot)
  useEffect(() => {
    if (!targetUid) {
      setLinksLoading(false);
      return;
    }

    const linksCollectionRef = collection(db, "users", targetUid, "links");
    const linksQuery = query(linksCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(linksQuery, (snapshot) => {
      const dbLinks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];

      setLinks(dbLinks);
      setLinksLoading(false);
    }, (err) => {
      console.error("동적 링크 로드 실패:", err);
      setLinksLoading(false);
    });

    return () => unsubscribe();
  }, [targetUid]);

  // 4. [요구사항 1, 2, 3] 링크 클릭 감지 및 increment(1) 비동기 전송 핸들러 (try-catch 콘솔 로깅 장착)
  const handleLinkClick = async (linkId: string) => {
    if (!targetUid) return;
    try {
      // updateDoc 와 increment 를 이용해 동시 클릭에도 유실 없는 Atomic 연산 수행
      const linkDocRef = doc(db, "users", targetUid, "links", linkId);
      await updateDoc(linkDocRef, {
        clickCount: increment(1)
      });
    } catch (err) {
      // 에러 확인 실패 시 콘솔 에러 기록 수행
      console.error("클릭 카운트 저장 및 로깅 실패:", err);
    }
  };

  // 클립보드 주소 복사 핸들러
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/${targetUsername}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  // 5. 세션 및 사용자 정보 조회 중 뷰 (Aesthetics)
  if (userLoading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <Icons.Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">사용자 프로필을 안전하게 조회하고 있습니다...</p>
        </div>
      </main>
    );
  }

  // 6. 사용자를 찾을 수 없을 때 404 커스텀 글래스모피즘 에러 뷰 표출
  if (userExists === false || !profile) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-slate-100 antialiased font-sans">
        <Card className="w-full max-w-sm border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl p-8 text-center space-y-6 animate-in fade-in duration-350">
          <div className="flex flex-col items-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-950/40 border border-rose-500/20 text-rose-500 shadow-lg shadow-rose-950/30">
              <Icons.ShieldAlert className="h-7 w-7 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-100 text-transparent bg-clip-text bg-gradient-to-r from-rose-450 to-orange-400">
                404 - 존재하지 않는 프로필
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[270px] mx-auto">
                요청하신 공유 주소 ID <span className="font-bold text-indigo-400">"@{targetUsername}"</span> 사용자를 찾을 수 없습니다. 철자를 확인하시거나 뒤로 이동해 보세요.
              </p>
            </div>
          </div>

          <Link href="/">
            <button className="w-full rounded-xl bg-[#5B5FC7] py-3 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 hover:bg-[#4b4fad] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 mt-4">
              <Icons.Home className="h-3.5 w-3.5" />
              <span>메인 화면으로 돌아가기</span>
            </button>
          </Link>
        </Card>
      </main>
    );
  }

  // 7. 정상 조회 완료 시 프로필 전용 랜딩 렌더링 뷰 (Aesthetics)
  const initial = profile.displayName ? profile.displayName.charAt(0) : "공";

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12 text-slate-100 antialiased font-sans">
      
      {/* 7.1 우측 상단 공유/복사 플로팅 버튼 위젯 */}
      <div className="absolute right-6 top-6 z-10">
        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-300 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-indigo-500/50 hover:bg-slate-900 hover:text-indigo-400 active:scale-95 cursor-pointer"
          title="마이링크 공유 주소 복사"
        >
          {copied ? (
            <Icons.Check className="h-5 w-5 text-indigo-400 animate-in fade-in zoom-in duration-200" />
          ) : (
            <Icons.Share2 className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
          )}
        </button>
        {copied && (
          <span className="absolute -bottom-9 right-0 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-650 animate-in slide-in-from-top-2 duration-200">
            주소 복사 완료!
          </span>
        )}
      </div>

      {/* 7.2 중앙 프로필 카드 컨테이너 */}
      <div className="flex w-full max-w-md flex-col items-center space-y-8">
        
        {/* 7.2.1 프로필 헤더 정보 (아바타, 닉네임, bio) */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <Avatar className="h-24 w-24 border-2 border-indigo-500/30 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-950/50 ring-4 ring-slate-950/60 transition-transform duration-500 hover:rotate-6">
            <AvatarFallback className="bg-transparent text-3xl font-extrabold tracking-wider text-slate-100">
              {initial}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200">
              {profile.displayName}
            </h1>
            <p className="text-xs text-indigo-400 font-bold tracking-wide">
              @{profile.username}
            </p>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-400 mt-1">
              {profile.bio || "아직 소개글이 등록되지 않았습니다."}
            </p>
          </div>
        </div>

        {/* 7.2.2 실물 링크 리스트 카드 섹션 */}
        <div className="w-full space-y-4">
          {linksLoading ? (
            // 로딩 중일 때 펄스 스켈레톤 리스트 렌더링
            <div className="flex flex-col space-y-4">
              {[1, 2, 3].map((n) => (
                <div 
                  key={n} 
                  className="h-[74px] w-full rounded-2xl border border-slate-800/40 bg-slate-900/10 animate-pulse backdrop-blur-sm" 
                />
              ))}
            </div>
          ) : links.length === 0 ? (
            // 데이터가 완전히 비었을 때 품격있는 안내 UI
            <div className="flex flex-col items-center justify-center p-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 backdrop-blur-sm text-slate-400 space-y-2 animate-in fade-in duration-300">
              <Icons.Link2Off className="h-7 w-7 text-indigo-500/60" />
              <p className="text-xs font-bold text-slate-350">등록된 링크가 존재하지 않습니다</p>
              <p className="text-[10px] text-slate-550">프로필 소유자가 아직 링크 카드를 게시하지 않았습니다.</p>
            </div>
          ) : (
            // [요구사항 4] 링크 카드는 새 탭(target='_blank')으로 열림
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
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
            ))
          )}
        </div>

        {/* 7.2.3 마이링크 브랜드 푸터 */}
        <footer className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase transition-colors duration-300 hover:text-indigo-400"
          >
            <Icons.Sparkles className="h-3.5 w-3.5" />
            <span>Made by MyLink</span>
          </Link>
        </footer>

      </div>
    </main>
  );
}
