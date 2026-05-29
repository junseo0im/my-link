"use client";

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { dummyLinks, LinkItem } from "../../data/links";
import { db } from "../../lib/firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  serverTimestamp,
  writeBatch,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  setDoc
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "../../components/auth-provider";

// 브랜드 아이콘 렌더링 헬퍼
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
  const { user, loading: authLoading, loginWithGoogle } = useAuth();

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 프로필 데이터 관리 State (Form Control)
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // 인라인 편집용 React State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState("");

  // 삭제 확인 모달용 React State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<LinkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. 프로필 실시간 구독 및 폼 초기 세팅
  useEffect(() => {
    if (authLoading || !user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (snap.exists() && snap.data()?.profile) {
        const p = snap.data().profile;
        if (!profileLoaded) {
          setProfileUsername(p.username || "");
          setProfileDisplayName(p.displayName || "");
          setProfileBio(p.bio || "");
          setProfileLoaded(true);
        }
      }
    });

    return () => unsubscribe();
  }, [user, authLoading, profileLoaded]);

  // 2. 링크 목록 실시간 구독 (onSnapshot) 및 개인화 최초 더미 마이그레이션 (clickCount: 0 초기화 지원)
  useEffect(() => {
    if (authLoading || !user) return;

    const linksCollectionRef = collection(db, "users", user.uid, "links");
    const linksQuery = query(linksCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(linksQuery, async (snapshot) => {
      const dbLinks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];

      // 신규 가입 유저 등 데이터가 하나도 없을 때, dummy 데이터 자동 마이그레이션 지원
      if (dbLinks.length === 0 && snapshot.empty) {
        try {
          const batch = writeBatch(db);
          dummyLinks.forEach((dummy, idx) => {
            const newDocRef = doc(linksCollectionRef);
            batch.set(newDocRef, {
              title: dummy.title,
              url: dummy.url,
              icon: dummy.icon,
              createdAt: new Date(Date.now() - idx * 1000),
              clickCount: 0 // [요구사항 2] 클릭 카운트 clickCount 필드 초기치 명시
            });
          });
          await batch.commit();
        } catch (err) {
          console.error("최초 더미 마이그레이션 오류:", err);
        }
      } else {
        setLinks(dbLinks);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore 실시간 리스너 오류:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  // 3. 프로필 저장 및 중복 차단 핸들러
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);

    const inputUsername = profileUsername.trim().toLowerCase();
    const inputDisplayName = profileDisplayName.trim();
    const inputBio = profileBio.trim();

    if (!inputUsername) {
      setProfileError("공유 아이디(username)를 입력해 주세요");
      setProfileSaving(false);
      return;
    }
    const usernamePattern = /^[a-z0-9_]{3,20}$/;
    if (!usernamePattern.test(inputUsername)) {
      setProfileError("공유 아이디는 3~20자의 영문 소문자, 숫자, 밑줄(_)만 사용 가능합니다.");
      setProfileSaving(false);
      return;
    }
    if (!inputDisplayName) {
      setProfileError("표시 이름을 입력해 주세요");
      setProfileSaving(false);
      return;
    }

    try {
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("profile.username", "==", inputUsername));
      const querySnapshot = await getDocs(q);

      let isDuplicate = false;
      querySnapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          isDuplicate = true;
        }
      });

      if (isDuplicate) {
        setProfileError("이미 사용 중인 공유 아이디(username)입니다. 다른 아이디를 입력해 주세요.");
        setProfileSaving(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        profile: {
          username: inputUsername,
          displayName: inputDisplayName,
          bio: inputBio
        }
      }, { merge: true });

      setProfileSuccess("프로필이 성공적으로 저장되었습니다!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      console.error("프로필 수정 저장 실패:", err);
      setProfileError("저장 과정에서 통신 오류가 발생했습니다. 네트워크 환경을 점검해 주세요.");
    } finally {
      setProfileSaving(false);
    }
  };

  // 4. 새 링크 등록 제출 핸들러 (clickCount: 0 추가)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    const inputTitle = title.trim();
    const inputUrl = url.trim();

    if (!inputTitle) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!inputUrl) {
      setError("주소를 입력해주세요");
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!urlPattern.test(inputUrl)) {
      setError("올바른 주소를 입력해주세요");
      return;
    }

    let formattedUrl = inputUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let detectedIcon = "link";
    const lowerUrl = formattedUrl.toLowerCase();
    if (lowerUrl.includes("instagram.com")) detectedIcon = "instagram";
    else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) detectedIcon = "youtube";
    else if (lowerUrl.includes("github.com")) detectedIcon = "github";
    else if (lowerUrl.includes("blog.naver.com") || lowerUrl.includes("tistory.com") || lowerUrl.includes("blog")) detectedIcon = "blog";
    else if (lowerUrl.includes("portfolio") || lowerUrl.includes("resume")) detectedIcon = "portfolio";

    try {
      const linksCollectionRef = collection(db, "users", user.uid, "links");
      await addDoc(linksCollectionRef, {
        title: inputTitle,
        url: formattedUrl,
        icon: detectedIcon,
        createdAt: serverTimestamp(),
        clickCount: 0 // [요구사항 2] 링크 신설 시 클릭 카운트 clickCount 필드 초기치 명시
      });

      setTitle("");
      setUrl("");
    } catch (err) {
      console.error("Firestore 링크 추가 실패:", err);
      setError("데이터베이스 저장에 실패했습니다. 네트워크 상태를 확인해주세요.");
    }
  };

  // 5. 인라인 편집 액션 핸들러들
  const handleStartEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
    setEditError("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!user) return;
    setEditError("");
    const inputTitle = editTitle.trim();
    const inputUrl = editUrl.trim();

    if (!inputTitle) {
      setEditError("제목을 입력해주세요");
      return;
    }
    if (!inputUrl) {
      setEditError("주소를 입력해주세요");
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!urlPattern.test(inputUrl)) {
      setEditError("올바른 주소를 입력해주세요");
      return;
    }

    let formattedUrl = inputUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let detectedIcon = "link";
    const lowerUrl = formattedUrl.toLowerCase();
    if (lowerUrl.includes("instagram.com")) detectedIcon = "instagram";
    else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) detectedIcon = "youtube";
    else if (lowerUrl.includes("github.com")) detectedIcon = "github";
    else if (lowerUrl.includes("blog.naver.com") || lowerUrl.includes("tistory.com") || lowerUrl.includes("blog")) detectedIcon = "blog";
    else if (lowerUrl.includes("portfolio") || lowerUrl.includes("resume")) detectedIcon = "portfolio";

    try {
      const docRef = doc(db, "users", user.uid, "links", id);
      await updateDoc(docRef, {
        title: inputTitle,
        url: formattedUrl,
        icon: detectedIcon
      });

      setEditingId(null);
      setEditTitle("");
      setEditUrl("");
    } catch (err) {
      console.error("Firestore 링크 수정 저장 오류:", err);
      setEditError("서버 전송 실패. 네트워크 상태를 점검해주세요.");
    }
  };

  // 6. 링크 삭제 액션 핸들러들
  const triggerDelete = (link: LinkItem) => {
    setLinkToDelete(link);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLinkToDelete(null);
  };

  const executeDelete = async () => {
    if (!user || !linkToDelete) return;
    setDeleting(true);

    try {
      const docRef = doc(db, "users", user.uid, "links", linkToDelete.id);
      await deleteDoc(docRef);

      setIsDeleteModalOpen(false);
      setLinkToDelete(null);
    } catch (err) {
      console.error("Firestore 링크 삭제 실패:", err);
    } finally {
      setDeleting(false);
    }
  };

  // 7. 통계 실시간 정밀 합산 및 정렬 연산
  // 7.1 총 클릭수 합계 연산 (reduce)
  const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  
  // 7.2 링크별 클릭수 내림차순 정렬 연산 (clickCount 많은 순 정렬)
  const sortedLinksByClicks = [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));

  // 8. Client Route Guard 분기 렌더링
  if (authLoading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <Icons.Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">인증 상태를 확인하고 있습니다...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-16 text-slate-100 antialiased font-sans">
        <Card className="w-full max-w-sm border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl p-6 text-center space-y-6 animate-in fade-in duration-350">
          <div className="flex flex-col items-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-[#5B5FC7] shadow-lg shadow-indigo-950/50">
              <Icons.Lock className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-extrabold tracking-tight text-slate-200">로그인이 필요한 서비스입니다</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                나만의 링크 카드를 안전하게 관리하고 실시간으로 외부에 배포하려면 Google 소셜 계정으로 로그인해 주세요.
              </p>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            className="w-full rounded-xl bg-[#5B5FC7] py-3 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 hover:bg-[#4b4fad] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.883-6.435-6.437 0-3.553 2.88-6.436 6.435-6.436 1.63 0 3.125.614 4.254 1.62l3.122-3.12A11.91 11.91 0 0012.24 2C6.583 2 2 6.584 2 12.24c0 5.657 4.583 10.24 10.24 10.24 5.795 0 10.24-4.117 10.24-10.24 0-.693-.06-1.362-.176-1.955H12.24z" />
            </svg>
            <span>Google 계정으로 로그인</span>
          </button>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12 text-slate-100 antialiased font-sans">
      <div className="w-full max-w-md flex flex-col space-y-8">
        
        {/* 1. 상단: 대시보드 제목 및 브랜딩 */}
        <header className="flex flex-col items-center text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-[#5B5FC7] shadow-lg shadow-indigo-950/50">
            <Icons.Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200">
              마이페이지
            </h1>
            <p className="text-xs font-semibold tracking-wider text-[#5B5FC7] uppercase">
              실시간 프로필 및 링크 카드 대시보드
            </p>
          </div>
        </header>

        {/* 2. 내 프로필 정보 편집 카드 */}
        <Card className="border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl shadow-slate-950/40 overflow-hidden border-t-2 border-t-[#5B5FC7]">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Icons.UserPen className="h-4.5 w-4.5 text-[#5B5FC7]" />
              <CardTitle className="text-base font-bold text-slate-200">내 프로필 정보 편집</CardTitle>
            </div>
            <CardDescription className="text-slate-400 text-xs">
              나의 개인화된 공유 URL용 아이디(username) 및 표시 프로필을 설정합니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleProfileSave} className="flex flex-col space-y-4">
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                  <span>1. 공유 주소 ID (username)</span>
                  <span className="text-[9px] text-[#5B5FC7] font-semibold lowercase">영문소문자/숫자/_ (3~20자)</span>
                </label>
                
                <div className="flex rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden focus-within:border-[#5B5FC7] focus-within:ring-1 focus-within:ring-[#5B5FC7] transition-all duration-300">
                  <span className="flex items-center bg-slate-900 border-r border-slate-800/80 px-3 text-[10px] text-slate-500 font-extrabold select-none tracking-wide">
                    mylink/
                  </span>
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full bg-transparent py-2.5 px-3 text-xs text-slate-100 placeholder:text-slate-650 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  2. 표시 이름 (displayName)
                </label>
                <div className="relative flex items-center">
                  <Icons.Signature className="absolute left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={profileDisplayName}
                    onChange={(e) => setProfileDisplayName(e.target.value)}
                    placeholder="표시될 이름을 입력하세요"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-650 focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  3. 소개글 (bio)
                </label>
                <div className="relative flex items-start">
                  <Icons.NotebookTabs className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="나를 소개하는 한 줄 소개글을 작성하세요."
                    rows={2}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-650 focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] focus:outline-none transition-all duration-300 resize-none"
                  />
                </div>
              </div>

              {profileError && (
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-rose-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Icons.AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-455 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Icons.CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full rounded-xl bg-[#5B5FC7] py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:bg-[#4b4fad] disabled:opacity-50 active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {profileSaving ? (
                  <Icons.Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icons.Save className="h-3.5 w-3.5" />
                )}
                <span>프로필 정보 저장하기</span>
              </button>

            </form>
          </CardContent>
        </Card>

        {/* 3. 새로운 링크 생성 카드 */}
        <Card className="border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl shadow-slate-950/40 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-200">새로운 링크 생성</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              개인용 클라우드 데이터베이스의 내 링크 리스트 컬렉션에 추가됩니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  1. 링크 제목
                </label>
                <div className="relative flex items-center">
                  <Icons.Type className="absolute left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 공식 인스타그램 바로가기"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-650 focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  2. 이동할 URL 주소
                </label>
                <div className="relative flex items-center">
                  <Icons.Globe className="absolute left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="예: instagram.com/username"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-650 focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-xs font-semibold text-rose-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Icons.AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#5B5FC7] py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:bg-[#4b4fad] hover:shadow-indigo-650/20 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Icons.PlusCircle className="h-4 w-4" />
                <span>링크 카드 추가하기</span>
              </button>

            </form>
          </CardContent>
        </Card>

        {/* 4. 중간: 실시간 링크 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              실시간 데이터베이스 연동 목록 ({links.length})
            </span>
            <a
              href={profileUsername ? `/${profileUsername}` : "/"}
              className="text-xs font-bold text-[#5B5FC7] hover:underline flex items-center space-x-1"
            >
              <span>내 전용 프로필 바로가기</span>
              <Icons.ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {loading ? (
            <div className="flex flex-col space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 w-full rounded-xl border border-slate-800/30 bg-slate-900/10 animate-pulse" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-800/80 bg-slate-900/10 text-slate-500 text-center text-xs space-y-2">
              <Icons.Inbox className="h-6 w-6 text-slate-650" />
              <p>아직 추가된 링크가 없습니다.</p>
              <p className="text-[10px] text-slate-600">위 양식을 통해 새로운 링크 카드를 생성해 보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const isEditing = link.id === editingId;

                return (
                  <div
                    key={link.id}
                    className="w-full rounded-xl border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm transition-all duration-300"
                  >
                    {isEditing ? (
                      /* 4.1 인라인 편집 활성화 모드 */
                      <div className="flex flex-col p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                            수정 링크 제목
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-white placeholder:text-slate-650 focus:border-[#5B5FC7] focus:outline-none transition-all duration-300"
                            placeholder="제목을 입력해주세요"
                          />
                        </div>

                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                            수정 URL 주소
                          </label>
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-white placeholder:text-slate-650 focus:border-[#5B5FC7] focus:outline-none transition-all duration-300"
                            placeholder="주소를 입력해주세요"
                          />
                        </div>

                        {editError && (
                          <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-rose-500 animate-in fade-in slide-in-from-top-0.5 duration-200">
                            <Icons.AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>{editError}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-800/40">
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-slate-200 active:scale-95 transition-all duration-200 cursor-pointer"
                          >
                            <Icons.X className="h-3.5 w-3.5" />
                            <span>취소</span>
                          </button>
                          <button
                            onClick={() => handleSaveEdit(link.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#5B5FC7] text-xs font-semibold text-white hover:bg-[#4d51b3] hover:shadow-md hover:shadow-indigo-950/20 active:scale-95 transition-all duration-200 cursor-pointer"
                          >
                            <Icons.Check className="h-3.5 w-3.5" />
                            <span>저장</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 4.2 일반 노출 모드 */
                      <div className="flex items-center justify-between p-3.5 group">
                        <div className="flex items-center min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950/40 border border-slate-800">
                            <BrandIcon name={link.icon || ""} />
                          </div>
                          <div className="ml-3 min-w-0 text-left">
                            <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                              {link.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {link.url}
                            </p>
                          </div>
                        </div>

                        {/* 수정 및 삭제 정렬 */}
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleStartEdit(link)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-500 transition-all duration-200 hover:border-slate-800 hover:bg-slate-950/50 hover:text-amber-400 active:scale-90 cursor-pointer"
                            title="링크 편집"
                          >
                            <Icons.Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => triggerDelete(link)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-500 transition-all duration-200 hover:border-slate-800 hover:bg-slate-950/50 hover:text-rose-500 active:scale-90 cursor-pointer"
                            title="링크 삭제"
                          >
                            <Icons.Trash2 className="h-4 w-4" />
                          </button>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-650 transition-all duration-200 hover:text-slate-400 active:scale-90"
                          >
                            <Icons.ChevronRight className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. [신규 추가 요구사항] 하단: 실시간 성과 통계 대시보드 섹션 */}
        <Card className="border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl shadow-slate-950/40 overflow-hidden border-t-2 border-t-[#5B5FC7]">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Icons.ChartNoAxesColumnIncreasing className="h-4.5 w-4.5 text-[#5B5FC7]" />
              <CardTitle className="text-base font-bold text-slate-200">실시간 성과 통계 대시보드</CardTitle>
            </div>
            <CardDescription className="text-slate-400 text-xs">
              개인용 링크 카드의 방문객 클릭수를 합산 및 분석하여 실시간 정렬 표출합니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            
            {/* 5.1 총 클릭수 합산 표시 영역 (강조 렌더링) */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-800/60 bg-slate-950/50 text-center space-y-1">
              <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                누적 총 링크 클릭수
              </span>
              <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">
                총 {totalClicks.toLocaleString()} 클릭
              </span>
              <span className="text-[9px] text-[#5B5FC7] font-semibold animate-pulse mt-1 flex items-center space-x-1">
                <Icons.Sparkles className="h-3 w-3 shrink-0" />
                <span>데이터 실시간 동기화 중</span>
              </span>
            </div>

            {/* 5.2 링크별 클릭수 목록 (클릭수 많은 순 정렬 및 게이지 바 시각화) */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold tracking-wider text-slate-455 uppercase border-b border-slate-800/60 pb-1.5">
                링크 카드별 반응 동향 (클릭 높은 순)
              </h4>

              {links.length === 0 ? (
                <p className="text-center text-slate-600 text-[11px] py-4">분석할 링크 데이터가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {sortedLinksByClicks.map((link) => {
                    // 점유율 비율 산출
                    const percentage = totalClicks > 0 
                      ? Math.min(100, Math.max(0, ((link.clickCount || 0) / totalClicks) * 100)) 
                      : 0;

                    return (
                      <div key={link.id} className="flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          {/* 브랜드 아이콘 + 타이틀 */}
                          <div className="flex items-center min-w-0 space-x-2">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-950/30 border border-slate-800/80">
                              <BrandIcon name={link.icon || ""} />
                            </div>
                            <span className="font-bold text-slate-200 truncate max-w-[200px]" title={link.title}>
                              {link.title}
                            </span>
                          </div>

                          {/* 클릭수 배지 강조 */}
                          <span className="text-[10px] font-extrabold text-slate-400 bg-slate-950/40 border border-slate-800/60 px-2 py-0.5 rounded-full shrink-0 flex items-center space-x-1">
                            {link.clickCount && link.clickCount > 0 ? (
                              <Icons.Flame className="h-3 w-3 text-amber-500 animate-bounce" />
                            ) : null}
                            <span>{link.clickCount || 0} clicks</span>
                          </span>
                        </div>

                        {/* 시각 게이지 바 차트 (Aesthetics) */}
                        <div className="w-full h-2 rounded-full bg-slate-950/60 border border-slate-800/40 overflow-hidden flex">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-[#5B5FC7] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </CardContent>
        </Card>

      </div>

      {/* 6. 삭제 2차 확인 오버레이 모달 */}
      {isDeleteModalOpen && linkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 py-6 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-6 flex flex-col space-y-6">
              
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/40 border border-rose-500/20 text-rose-500 shadow-lg shadow-rose-950/30">
                  <Icons.AlertTriangle className="h-6 w-6 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-100 tracking-tight">
                    정말 삭제하시겠습니까?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-extrabold text-slate-200 break-all">"{linkToDelete.title}"</span> 링크가 삭제됩니다
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-400">
                <Icons.AlertOctagon className="h-4.5 w-4.5 shrink-0" />
                <span className="text-[10px] font-bold tracking-wide">
                  ⚠️ 이 작업은 되돌릴 수 없습니다
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-slate-800 py-3 text-xs font-bold text-slate-400 hover:bg-slate-950 hover:text-slate-200 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-950/30 hover:bg-rose-500 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {deleting ? (
                    <Icons.Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Icons.Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>삭제하기</span>
                </button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

    </main>
  );
}
