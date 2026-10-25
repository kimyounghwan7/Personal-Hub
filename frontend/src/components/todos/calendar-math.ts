import { SpanBarSegment, TodoItem, WeekRowData } from '@/components/todos/types';

export function formatIsoDate(targetDate: Date): string {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function extractIsoDatePart(rawDateValue: string | null | undefined): string | null {
  if (!rawDateValue) return null;
  const trimmed = rawDateValue.trim();
  if (!trimmed) return null;
  if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsedDate = new Date(trimmed);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return formatIsoDate(parsedDate);
}

export function isTodoOverdue(todo: TodoItem, todayIso: string): boolean {
  if (todo.status === 'completed') return false;
  const dueIso = extractIsoDatePart(todo.due_date);
  if (!dueIso) return false;
  return dueIso < todayIso;
}

export function buildMonthWeekRows(
  year: number,
  monthZeroIndexed: number,
  todos: TodoItem[],
): WeekRowData[] {
  const firstDayOfMonth = new Date(year, monthZeroIndexed, 1);
  const mondayBasedOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStartDate = new Date(year, monthZeroIndexed, 1 - mondayBasedOffset);

  const weekRows: WeekRowData[] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const days: Date[] = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const cellDate = new Date(gridStartDate);
      cellDate.setDate(gridStartDate.getDate() + weekIndex * 7 + dayOffset);
      days.push(cellDate);
    }

    const weekStartIso = formatIsoDate(days[0]);
    const weekEndIso = formatIsoDate(days[6]);

    const rawSegments: Omit<SpanBarSegment, 'laneIndex'>[] = [];
    const pointTasksByDayIso: Record<string, TodoItem[]> = {};
    for (const dayDate of days) {
      pointTasksByDayIso[formatIsoDate(dayDate)] = [];
    }

    for (const todo of todos) {
      const dueIso = extractIsoDatePart(todo.due_date);
      const startIso = extractIsoDatePart(todo.started_on) ?? dueIso;

      if (!dueIso || !startIso) continue;

      const isMultiDaySpan = startIso < dueIso;
      if (!isMultiDaySpan) {
        if (dueIso >= weekStartIso && dueIso <= weekEndIso) {
          pointTasksByDayIso[dueIso]?.push(todo);
        }
        continue;
      }

      if (dueIso < weekStartIso || startIso > weekEndIso) {
        continue;
      }

      const clampedStartIso = startIso < weekStartIso ? weekStartIso : startIso;
      const clampedEndIso = dueIso > weekEndIso ? weekEndIso : dueIso;

      const startCol = Math.max(
        0,
        days.findIndex((dayDate) => formatIsoDate(dayDate) === clampedStartIso),
      );
      const endCol = Math.max(
        startCol,
        days.findIndex((dayDate) => formatIsoDate(dayDate) === clampedEndIso),
      );

      rawSegments.push({
        todo,
        startCol,
        spanCols: endCol - startCol + 1,
        isClippedLeft: startIso < weekStartIso,
        isClippedRight: dueIso > weekEndIso,
      });
    }

    rawSegments.sort((leftSeg, rightSeg) => {
      if (leftSeg.startCol !== rightSeg.startCol) {
        return leftSeg.startCol - rightSeg.startCol;
      }
      return rightSeg.spanCols - leftSeg.spanCols;
    });

    const laneEndColumns: number[] = [];
    const spanSegments: SpanBarSegment[] = rawSegments.map((segment) => {
      const segmentEndCol = segment.startCol + segment.spanCols - 1;
      let assignedLane = laneEndColumns.findIndex((lastEndCol) => lastEndCol < segment.startCol);
      if (assignedLane === -1) {
        assignedLane = laneEndColumns.length;
        laneEndColumns.push(segmentEndCol);
      } else {
        laneEndColumns[assignedLane] = segmentEndCol;
      }

      return {
        ...segment,
        laneIndex: assignedLane,
      };
    });

    weekRows.push({
      weekIndex,
      days,
      spanSegments,
      pointTasksByDayIso,
    });
  }

  return weekRows;
}

export function buildSamplePreviewTodos(referenceDate: Date): TodoItem[] {
  const year = referenceDate.getFullYear();
  const monthIndex = referenceDate.getMonth();
  const makeDateStr = (dayNumber: number) =>
    formatIsoDate(new Date(year, monthIndex, dayNumber));

  return [
    {
      id: 'sample-1',
      title: 'Cloudflare WAF + Rate Limit 규칙 검증',
      description: '/api/v1/* 경로 분당 요청 상한 및 Orange Cloud 프록시 점검',
      status: 'pending',
      started_on: makeDateStr(3),
      due_date: makeDateStr(6),
      priority: 1,
      category: 'Infra',
    },
    {
      id: 'sample-2',
      title: 'Supabase Session Pooler (:6543) 부하 점검',
      description: '트랜잭션 풀러 연결 한도 및 로컬 PyJWT 검증 지연 시간 확인',
      status: 'completed',
      started_on: makeDateStr(7),
      due_date: makeDateStr(9),
      priority: 2,
      category: 'Work',
    },
    {
      id: 'sample-3',
      title: 'Render 고정형 컨테이너 배포 런북 리허설',
      description: '오토스케일링 비활성화 및 Spend Cap 체크리스트 검증',
      status: 'pending',
      started_on: makeDateStr(10),
      due_date: makeDateStr(10),
      priority: 1,
      category: 'Infra',
    },
    {
      id: 'sample-4',
      title: '캘린더 멀티데이 Span Bar & 우측 레일 UI 통합',
      description: '파스텔 민트(#8ee3be) 테마 기반 월간 캘린더 + 백로그 레일 설계 반영',
      status: 'pending',
      started_on: makeDateStr(13),
      due_date: makeDateStr(17),
      priority: 2,
      category: 'Work',
    },
    {
      id: 'sample-5',
      title: 'Alembic 마이그레이션 S1~S8 규칙 적합성 점검',
      description: 'soft-delete 3종 세트 및 partial live 인덱스 스키마 검토',
      status: 'pending',
      started_on: null,
      due_date: null,
      priority: 3,
      category: 'Study',
    },
    {
      id: 'sample-6',
      title: '개인 포트폴리오 도메인(.dev / .kr) 등록 후보 확정',
      description: 'Cloudflare Registrar vs 가비아 갱신 비용 비교 후 결정',
      status: 'pending',
      started_on: null,
      due_date: null,
      priority: 4,
      category: 'Personal',
    },
  ];
}
