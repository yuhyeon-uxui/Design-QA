# 트러블슈팅 기록 (Troubleshooting Log)

## 1. Firebase 실시간 연동 중 Local UI State 전이 현상 (2026-06-01)

### 📌 문제 상황 (Issue)
- 다수의 사용자가 QA 보드(ScreenQA)에 접속 중일 때, 한 사용자가 특정 핀(이슈)을 클릭하면 접속 중인 다른 모든 사용자의 화면에서도 강제로 해당 핀 상세 보기로 전환되는 현상 발생.
- 사용자 경험 상 마치 여러 명이 하나의 마우스를 공유하는 것과 같은 오작동(버그)으로 인지됨.

### 🔍 원인 분석 (Cause)
- QA 화면에 필요한 모든 데이터(이미지 URL, 핀 좌표, 코멘트 목록 등)를 하나의 객체인 `ScreenDeviceState`로 묶어서 Firebase Realtime Database(Firestore)에 동기화하도록 설계됨.
- 이 과정에서 핀에 대한 공통 데이터뿐만 아니라, **"현재 브라우저에서 사용자가 클릭해서 보고 있는 핀의 ID(`activePinId`)"** 값까지 `ScreenDeviceState`에 포함되어 있었음.
- 한 사용자가 핀을 클릭하면 로컬 UI 상태가 변경될 뿐만 아니라, 이 상태가 서버의 `screens` 데이터 전체 업데이트(updateActiveDeviceState)를 트리거하여 Firebase에 반영됨.
- Firebase의 `onSnapshot` 이벤트가 실시간으로 다른 클라이언트로 해당 변경 사항을 푸시하면서, 다른 사용자의 로컬 `activePinId`마저 강제로 덮어씌워버림.

### 🛠 해결 방법 (Resolution)
- **로컬 UI 상태 분리 (Decoupling UI State from Shared State):**
  - `ScreenDeviceState` 인터페이스 및 Firestore 동기화 대상 객체에서 `activePinId` 필드를 완전히 제거함.
  - `page.tsx` 내부에서 `activePinId`를 서버 연동과 무관한 순수 로컬 React State(`useState`)로 분리함.
- **상태 초기화 로직 보완:**
  - 기기 변경(PC <-> Mobile) 또는 화면 변경 시 이전 화면의 `activePinId`가 잔존하지 않도록 `useEffect`를 사용해 로컬 상태를 깔끔하게 초기화(`null`) 하도록 개선.

### 💡 교훈 및 향후 개선점 (Takeaway)
- 상태 관리를 설계할 때, "여러 사용자가 동일하게 공유해야 하는 서버 상태(Server State)"와 "사용자 개인의 화면에서 일시적으로 유지되는 클라이언트 상태(Client/Local UI State)"를 명확히 구분해야 함.
- 스크롤 위치, 모달 창 오픈 여부, 현재 포커스된 항목(active item) 등은 절대로 서버 동기화 객체에 포함되어서는 안 됨.
