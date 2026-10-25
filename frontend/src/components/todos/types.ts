export type TodoPriority = 1 | 2 | 3 | 4;

export type TodoCategoryTag = 'Work' | 'Personal' | 'Infra' | 'Study';

export type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  started_on?: string | null;
  due_date: string | null;
  priority: number;
  category?: TodoCategoryTag;
};

export type WorkspaceViewMode = 'calendar' | 'list';
export type CalendarMode = 'month' | 'agenda';
export type StatusFilterMode = 'all' | 'pending' | 'completed' | 'overdue';

export type SpanBarSegment = {
  todo: TodoItem;
  startCol: number;
  spanCols: number;
  laneIndex: number;
  isClippedLeft: boolean;
  isClippedRight: boolean;
};

export type WeekRowData = {
  weekIndex: number;
  days: Date[];
  spanSegments: SpanBarSegment[];
  pointTasksByDayIso: Record<string, TodoItem[]>;
};
