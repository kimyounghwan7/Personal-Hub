---
paths:
  - "docs/**"
  - "**/*.md"
---

# md 작성 규칙

1. **머리 두 줄**: 첫 줄 제목(`# ...`), 다음 줄 `YYYY-MM-DD · 상태: **초안** | **승인** | **현행** | **보관** | **폐기(→ 대체 문서)** · 관련: 링크`. (`docs/status.md`, `docs/decisions.md`, `docs/README.md`, `docs/runbooks/*.md`, `docs/lessons/*.md`, `docs/reports/YYYY-MM-DD_*.md` 에 적용)
2. **도식은 mermaid** (흐름도 · 시퀀스 · 상태도 · 클래스도). 디렉토리 트리만 텍스트로 둔다. 쓴 뒤 `python3 tools/docs_check.py` 로 렌더되는지 확인한다.
3. **사실에는 출처**: `파일:줄` · 커밋 해시 · 보고서 링크. 확인 못 한 것은 "확인 못 한 것" 절에 모은다.
4. **고칠 때 지우지 않는다**: 보고서는 정정 상자를 단다. 설계는 상태를 바꾸고 대체 문서를 링크한다.
5. **결정은 `docs/decisions.md` 한 곳**에 둔다. 다른 문서는 결정 번호(`WF-1`, `CS-1`, `ARCH-1` 등)로 가리킨다.
6. **파일 이름**: 보고서 `YYYY-MM-DD_주제.md` · 런북·교훈 `주제-하이픈.md`. 소문자.
7. **색인**: 새 문서는 그 디렉토리 `README.md` 와 `docs/README.md` 에 한 줄을 더한다.
8. 이모지·별표 같은 장식 기호를 현행 기술 문서에 남발하지 않는다. 강조는 굵게, 구분은 표·목록으로.
9. 한국어로 쓴다. 영어는 명령어 · 파일명 · 식별자에만.
10. **문서 번호·약어(결정 번호 · 단계 번호)는 처음 쓸 때 뜻을 함께 쓴다.** "CS-1" 만 적지 않고 "무제한 종량제 금지 및 고정 상한 요금제 사용(CS-1)" 처럼 뜻을 함께 적는다. `docs/decisions.md` 에 없는 결정 번호는 쓰지 않는다 — `docs_check.py` 가 막는다.
11. **mermaid 는 다크 · 라이트 테마 둘 다에서 읽히게 그린다.** 채움색을 쓸 때는 어두운 채움 + 흰 글자를 명시한다 — 끝남 `fill:#1f6f3f,stroke:#3fb950,color:#ffffff` · 지금 `fill:#7a5a00,stroke:#d29922,color:#ffffff` · 위험/문제 `fill:#8b1e1e,stroke:#f85149,color:#ffffff`.

커밋 전에 `python3 tools/docs_check.py` 를 돌린다(깨진 링크 · mermaid 렌더 · 색인 누락 · 머리 누락 · 미등록 결정 번호).
