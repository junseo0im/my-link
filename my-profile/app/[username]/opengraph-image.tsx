import { ImageResponse } from "next/og";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const runtime = "edge";
export const alt = "MyLink - 나를 세상에 연결하는 단 하나의 링크";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const targetUsername = resolvedParams.username.toLowerCase();

  let displayName = "사용자";
  let bio = "MyLink 프로필 카드에 오신 것을 환영합니다.";
  let linkCount = 0;
  let userExists = false;

  // 1. [요구사항 1, 2, 3] Firestore 에서 실시간 사용자 프로필 및 links 수량 집계
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("profile.username", "==", targetUsername));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      let foundUid = "";
      querySnapshot.forEach((doc) => {
        foundUid = doc.id;
        const profile = doc.data().profile;
        displayName = profile.displayName || "사용자";
        bio = profile.bio || "MyLink 프로필 카드";
      });

      // 해당 사용자의 links 서브컬렉션 개수 조회
      const linksRef = collection(db, "users", foundUid, "links");
      const linksSnapshot = await getDocs(linksRef);
      linkCount = linksSnapshot.size;
      userExists = true;
    }
  } catch (err) {
    console.error("OG 이미지 데이터 쿼리 실패:", err);
  }

  // 2. [요구사항 4] 한글 Noto Sans KR 서브셋 Bold 폰트 바이너리 실시간 로드 (한글 깨짐 차단)
  let fontData: ArrayBuffer | null = null;
  try {
    const fontUrl = "https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/SubsetOTF/KR/NotoSansKR-Bold.otf";
    fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());
  } catch (err) {
    console.error("Noto Sans KR 폰트 로드 실패:", err);
  }

  const fonts = fontData 
    ? [{ name: "Noto Sans KR", data: fontData, style: "normal" as const, weight: 700 as const }]
    : [];

  const initial = displayName.charAt(0);

  // 3. [요구사항 2, 3] 보라색 테마 (#5B5FC7) 오픈 그래프 이미지 렌더링
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #5B5FC7 100%)",
          color: "#f8fafc",
          padding: "60px",
          fontFamily: "Noto Sans KR, sans-serif",
          position: "relative",
        }}
      >
        {/* 상단 브랜딩 영역 */}
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "60px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* 반짝이 로고 모형 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(91, 95, 199, 0.2)",
              border: "1px solid rgba(91, 95, 199, 0.4)",
              color: "#ffffff",
              marginRight: "12px",
              fontSize: "20px",
            }}
          >
            ✦
          </div>
          <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "1px", color: "#ffffff" }}>
            MyLink
          </span>
        </div>

        {/* 중앙 프로필 카드 컨테이너 (Glassmorphism) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.65)",
            border: "2px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "32px",
            padding: "50px 80px",
            width: "840px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* 아바타 (둥근 원형) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "110px",
              height: "110px",
              borderRadius: "55px",
              background: "linear-gradient(45deg, #5B5FC7 0%, #8b5cf6 100%)",
              fontSize: "44px",
              fontWeight: 900,
              color: "#ffffff",
              marginBottom: "25px",
              border: "4px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 10px 25px rgba(91, 95, 199, 0.35)",
            }}
          >
            {initial}
          </div>

          {/* 프로필 정보: 이름, 소개글 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px" }}>
            <span style={{ fontSize: "38px", fontWeight: 900, color: "#ffffff", marginBottom: "5px" }}>
              {displayName}
            </span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#a5b4fc" }}>
              @{targetUsername}
            </span>
          </div>

          <p
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#cbd5e1",
              textAlign: "center",
              lineHeight: 1.6,
              margin: "0 0 25px 0",
              maxWidth: "600px",
            }}
          >
            {bio}
          </p>

          {/* 링크 배지: "N개의 링크" */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(91, 95, 199, 0.15)",
              border: "1px solid rgba(91, 95, 199, 0.4)",
              borderRadius: "20px",
              padding: "8px 24px",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#e0e7ff" }}>
              🔥 {linkCount}개의 활성 링크 카드 게시 중
            </span>
          </div>
        </div>

        {/* 하단 공유 주소 브랜딩 URL */}
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            fontSize: "16px",
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.45)",
            letterSpacing: "0.5px",
          }}
        >
          mylink.com/{targetUsername}
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
