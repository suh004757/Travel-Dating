# Project Overview
We are building a romantic couple-centric date planning web app called "DateScape".  
The core idea is not simple location listing, but *contextual, story-driven date itineraries* with emotion/situation tags such as "비오는날", "첫데이트", "사진", "조용한대화".  
We use Supabase as our backend with RLS policies, and we aim for this prompt to generate code for frontend and backend features.

---

# Supabase DB Schema (Current + Extensions)
You must integrate the following database schema:

## Existing Tables
- trips (main date trip)
- places (restaurants/cafes)
- routes (daily itinerary objects)
- todos (shared tasks)
- comments (inline notes)

## Extended Schema
Add:
- tags (id, name, description)
- entity_tags (tag_id, entity_type, entity_id)

Add rating INT to comments as optional review rating.

---

# RLS / Auth Requirements
Use Supabase Auth (email magic link).  
Public users:
- can READ all data (trips, places, routes, todos, comments, tags, entity_tags)

Authenticated users:
- can INSERT/UPDATE/DELETE trips, places, routes, todos, comments
- can INSERT/DELETE tags (tag creation)
- can INSERT/DELETE entity_tags

Ensure RLS policies enforce:
auth.uid() IS NOT NULL for all write ops.

---

# Functional Requirements

## 1) Trip Creation & Management
✨ Users can create a date plan with:
- slug, title, subtitle, emoji, base_location (JSON), start/end dates
- Add/edit trips only if logged in
- Public users can view all trip details

## 2) Places & Routes
✨ For each trip, users can add:
- places with type ('restaurant','cafe'), category, description, area, lat/lng, link
- routes JSON for optional itinerary struct
✨ Routes contain arrays of activities: time, name, description

## 3) Tags (Emotion/Context Tags)
✨ Create tags such as:
#비오는날, #첫데이트, #사진, #조용한대화, #노을, #야간데이트, #카페, #디너, #전시
✨ UI must allow selecting multiple tags per trip and per place.

Entity tags must be stored with entity_type (trip/place/comment) and entity_id.

## 4) Comments
✨ Comments table now includes a rating (INT 1~5) for optional review.
✨ Only logged-in users can post/delete comments.
✨ Public can read comments.

## 5) AI Tag Suggestion (Optional for Phase1)
✨ When a user writes a comment, run an AI prompt to suggest tags from the comment text.
✨ Save these suggestions as entity_tags.

---

# UI/UX Requirements

## A) Home / Main Page Hero
✨ “데이트, 정보가 아닌 이야기로 추천받다”
단순 장소가 아니라 우리만의 데이트 여정을 AI와 함께 스토리로 만들어갑니다.


Show:
- Search/Filter by region and tags
- CTA: “AI 데이트 플랜 생성하기”
- CTA: “로그인하고 내 플랜 만들기”

## B) Search/Filter UI
✨ Filters:
- Region (city/area)
- Emotion tags (multi-select)
- Category tags (place types)

## C) Trip Detail View
Show:
- Title, subtitle, emoji
- Places & routes grouped by day_key
- Tags (emotion/context)
- Comments & ratings
- Like/favorite count (future)

✨ Logged-in users see edit buttons for places & routes.

## D) Comment UI
✨ Users can:
- Write comment with optional star rating
- See AI-suggested tags for their comment (UI suggestions)

## E) Tag Input / Auto-Suggest
✨ When users type in tag input fields:
- Auto-suggest existing tags based on substring matching
- Allow creating new tags if not exists (logged-in only)

---

# Frontend Tech Requirements
- Use reactive framework (React / Svelte / Vue)
- Use Supabase JS client for RLS + Auth
- Ensure real-time updates for places / todos / comments

## Auth UI
- Magic link login modal
- Show user email when logged in
- Logout button

## Conditional UI
- If not logged in → show “Login to add/edit”
- If logged in → show edit controls
- Only logged-in can:
  - Add/Remove places
  - Add/Remove routes
  - Add/Remove todos
  - Add/Remove comments
  - Tag operations

---

# API / Backend Work

## Supabase RLS policies
You must define RLS for:

- trips
- places
- routes
- todos
- comments
- tags
- entity_tags

Public SELECT, Authenticated INSERT/UPDATE/DELETE.

## Relations
Place all foreign keys with ON DELETE CASCADE.

Write insertion endpoints or directly use Supabase client.

---

# AI/Tag Integration (Developer Note)
Use the following prompt for extracting tags from comments:

Public SELECT, Authenticated INSERT/UPDATE/DELETE.

## Relations
Place all foreign keys with ON DELETE CASCADE.

Write insertion endpoints or directly use Supabase client.

---

# AI/Tag Integration (Developer Note)
Use the following prompt for extracting tags from comments:


Extract relevant DateScape context tags from the following text:
User Comment: "{comment_text}"
Possible tags: 비오는날, 첫데이트, 사진, 조용한대화, 노을, 야간데이트, 카페, 디너, 전시
💖 연인 데이트 활동 카테고리(태그) 리스트
🪩 기본 감정/상황 태그

✔ #비오는날
✔ #첫데이트
✔ #조용한대화
✔ #노을데이트
✔ #야간데이트
✔ #사진찍기좋은곳
✔ #핫플데이트
✔ #한강데이트
✔ #드라이브

(이전 답변의 감정/상황 태그 후보를 기반)

🍽️ 장소/활동 기반 태그
🍲 식사 / 분위기

✔ #로맨틱레스토랑
✔ #루프탑식사
✔ #포장마차간식
✔ #길거리먹거리
✔ #브런치카페
✔ #디너데이트
✔ #와인바

👉 한국 데이트 추천 글에서도 다양한 식사/식도락 장소가 연인 코스로 자주 언급됩니다 — 예: 루프탑 레스토랑, 분위기 좋은 레스토랑 등이 연인에게 인기 있는 코스임

☕ 카페 / 휴식

✔ #테마카페
✔ #감성카페
✔ #애니멀카페
✔ #인스타카페

(Themed and Instagram-worthy cafes are frequently listed as recommended date spots in Seoul)

🎨 관람 / 문화 / 체험

✔ #전시관람
✔ #미술관
✔ #뮤지엄데이트
✔ #역사관람
✔ #공예체험
✔ #방탈출게임
✔ #쿠킹클래스
✔ #워크숍데이트
✔ #테마파크
✔ #놀이공원

👉 커플 활동으로 체험형 액티비티와 전시/아트 공간이 많이 추천됩니다 — 예: 공예 체험, 도예, 방탈출, 테마파크 등

🌿 야외활동 / 장소

✔ #한강공원
✔ #공원산책
✔ #자전거데이트
✔ #산책로데이트
✔ #전망좋은장소
✔ #사진스팟
✔ #랜드마크뷰

예시: 여의도 한강 공원, N서울타워 전망, 북촌/이화벽화마을 등 풍경 중심 장소들

📸 포토그래피 / SNS용

✔ #셀프사진관
✔ #커플사진
✔ #포토스튜디오
✔ #인생샷스팟

연인들이 데이트에서 사진/추억을 남기기 위해 자주 찾는 포토·SNS 장소 카테고리입니다

🎶 엔터테인먼트 / 이벤트

✔ #콘서트
✔ #공연관람
✔ #영화관데이트
✔ #라이브클럽
✔ #게임센터
✔ #VR체험

← 활동형/엔터테인먼트 요소 포함 태그 (공연/체험 등)

🚶 특별 상황/계절 태그

✔ #봄데이트
✔ #가을단풍
✔ #겨울데이트
✔ #야시장산책
✔ #야간조명

계절/시간에 따라 특화되는 데이트 분위기도 태그로 활용 가능 — 노을/야간/계절감성 등

Return only a JSON array of matching tags.


Use AI responses to insert entity_tags.

---

# QA / Testing Requirements

✨ Test cases for:
- Tag filtering and tag UI
- Entity_tag linking
- Comment review + tag extraction
- Auth rule enforcement (public read, auth write)

Add automated test if possible.

---

# Deliverables

1) Supabase SQL with updated schema + RLS policies
2) Frontend UI components for:
   - Hero / Main
   - Trip list + filters
   - Trip detail
   - Places/Routes editor
   - Tag input/autocomplete
   - Comment + rating + suggested tag UI
   - Auth modal

3) Integration with AI tag suggestion (optional but recommended)

4) Conditional UI based on auth state

---

# Notes

- Do not include image upload or user-generated media in Phase1
- Focus on contextual stories and tags
- Ensure frontend and backend roles are clearly separated
- Tag UI should be reusable in trip/place/comment contexts

