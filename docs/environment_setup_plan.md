# 환경 설정 계획 (Environment Setup Plan)

## 기술 스택 구성 (Tech Stack)
- **Frontend Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling / UI**: Tailwind CSS, shadcn/ui, lucide-react
- **Database & Auth & Storage**: Supabase (PostgreSQL)
- **Canvas / Interaction**: React Konva (또는 CSS absolute x/y% 포지셔닝)
- **Export**: ExcelJS (엑셀 다운로드)
- **State Management**: TanStack Query (또는 React Context / Zustand)

## 로컬 개발 환경 셋업
1. Node.js (v18+) 설치
2. `npm install` 로 의존성 설치
3. `.env.local` 에 Supabase 환경변수 등록:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `npm run dev` 로 로컬 서버 실행

## 배포 (Deployment)
- **Frontend**: Vercel 연동을 통한 CI/CD 구성
- **Database**: Supabase 클라우드 활용
