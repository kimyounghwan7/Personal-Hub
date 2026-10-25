# 웹서버 배포 시 과금 폭탄이 터지는 5대 위험 지점과 방어 원리

2026-10-25 · 상태: **현행** · 관련: [lessons 색인](README.md) · [배포 런북](../runbooks/cost-safe-deployment.md) · [점검 및 아키텍처 보고서](../reports/2026-10-25_project-inspection-and-cost-architecture.md)

로컬에서 잘 돌아가던 웹서버를 도메인에 연결해 인터넷에 공개했을 때, 예상치 못한 요금 폭탄이나 서버 마비가 발생하는 원인과 이를 구조적으로 차단하는 교훈을 정리한다.

## 1. 무제한 종량제(Pay-as-you-go) + Auto-scaling 의 함정
- **원인**: 트래픽이나 공격(DDoS, 무한 루프 버그)이 들어오는 만큼 서버 대수와 네트워크 대역폭(Egress)을 무제한으로 늘리고 사후 청구하는 클라우드 설정.
- **교훈**: 개인/소규모 프로젝트는 반드시 **한도 도달 시 추가 과금 없이 요청을 거절하거나 일시 정지하는 하드 캡(Hard Cap) 플랜**(Vercel Hobby 무료, Supabase Spend Cap ON, 백엔드 단일 고정 인스턴스 — 결정 CS-1)을 사용해야 한다. "서비스가 잠시 느려지거나 503이 뜨는 것"이 "수백만 원이 청구되는 것"보다 항상 안전하다.

## 2. 앞단 방어선(WAF / Rate Limit)과 입력 크기 제한 부재
- **원인**: 도메인을 백엔드 서버에 곧바로 연결하고, API 입력 문자열 길이나 조회 건수에 제한을 두지 않으면 스크립트 하나로 수십 MB 데이터를 수만 번 밀어 넣어 DB 용량과 메모리를 즉시 고갈시킬 수 있다.
- **교훈**: 도메인 DNS 는 반드시 Cloudflare 무료 프록시(WAF Rate Limit, 결정 CS-2)를 거치게 하고, 백엔드 Pydantic 스키마에는 `max_length` 와 조회 `limit` 상한(결정 CS-3)을 걸어야 한다.

## 3. 매 요청마다 외부 인증 API를 호출하는 구조
- **원인**: 백엔드가 토큰을 검증할 때마다 `supabase.auth.get_user(token)` 처럼 외부 네트워크 API 를 호출하면, 공격자가 가짜 토큰을 대량으로 보냈을 때 백엔드→Supabase 구간이 포화되고 Auth 한도가 소진된다.
- **교훈**: 토큰 검증은 `SUPABASE_JWT_SECRET` 으로 **백엔드 메모리 안에서 로컬 서명 검증(HS256)** 만 수행하고, 프로덕션에서는 외부 API Fallback 을 반드시 꺼야 한다(`ALLOW_SUPABASE_AUTH_FALLBACK=False`, 결정 CS-4).

## 4. 누구나 가입 즉시 DB 쓰기가 가능한 열린 구조
- **원인**: 공개된 사이트에서 봇이 대량 회원가입 후 데이터를 무한 생성하면 DB 스토리지가 찬다.
- **교훈**: 본 프로젝트처럼 가입 직후 `is_approved=False` 로 두고 관리자 승인(`get_current_approved_profile`, 결정 ARCH-1)을 통과한 계정만 DB 쓰기/조회를 허용하면, 설령 봇이 가입하더라도 백엔드에서 `403 Forbidden` 으로 즉시 차단된다.

## 5. `service_role` 비밀키(`SUPABASE_KEY`)와 `anon` 공개키 혼동
- **원인**: `SUPABASE_KEY`(`service_role`)는 모든 RLS 보안 정책을 무시하는 슈퍼 관리자 키다. 이를 `NEXT_PUBLIC_*` 환경변수나 프론트엔드 배포 환경에 넣으면 브라우저 개발자 도구에서 누구나 꺼내어 DB 전체를 삭제하거나 대량 트래픽을 일으킬 수 있다.
- **교훈**: 프론트엔드에는 오직 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 만 두고, `SUPABASE_KEY` 는 백엔드 서버 환경변수에만 격리한다.
