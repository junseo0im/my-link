export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string; // Lucide React 아이콘 이름 등 매핑용 선택 필드
}

export const dummyLinks: LinkItem[] = [
  {
    id: "link-instagram",
    title: "공식 인스타그램 (Instagram)",
    url: "https://instagram.com/junseo_im",
    icon: "instagram"
  },
  {
    id: "link-youtube",
    title: "유튜브 채널 (YouTube)",
    url: "https://youtube.com/c/junseo_dev",
    icon: "youtube"
  },
  {
    id: "link-blog",
    title: "개인 기술 블로그 (Naver Blog)",
    url: "https://blog.naver.com/junseo_dev",
    icon: "blog"
  },
  {
    id: "link-github",
    title: "공식 깃허브 (GitHub)",
    url: "https://github.com/junseo0im",
    icon: "github"
  },
  {
    id: "link-portfolio",
    title: "퍼스널 포트폴리오 사이트 (Portfolio)",
    url: "https://junseo-portfolio.com",
    icon: "portfolio"
  }
];
