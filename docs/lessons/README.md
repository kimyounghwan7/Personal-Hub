# lessons — 사고에서 나온 교훈

2026-10-25 · 상태: **현행** · 관련: [status](../status.md) · [runbooks](../runbooks/README.md)

클라우드 비용 폭탄, 보안 우회, 배포 설정에서 조용히 틀리는 지점과 원인을 기록한다. 절차는 [runbooks](../runbooks/README.md)에, 원리와 교훈은 여기에 둔다.

| 분류 | 문서 | 한 줄 |
|---|---|---|
| 비용·보안 | [cloud-billing-shock-points](cloud-billing-shock-points.md) | 웹서버 배포 후 말도 안 되는 과금이 터지는 5가지 구조적 원인(무제한 오토스케일 · Rate Limit 부재 · 인증 API 외부 호출 · DB 커넥션 고갈 · `service_role` 키 노출)과 하드 캡 방어 원리 |
