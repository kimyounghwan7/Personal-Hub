import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Layers,
  Lock,
  ServerCog,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';

const ARCHITECTURE_HIGHLIGHTS = [
  {
    icon: CalendarCheck2,
    badge: 'Productivity Workspace',
    title: 'Synchronized To-Do & Calendar',
    description:
      'Manage daily tasks with priority levels, instant completion toggles, and real-time monthly calendar span bars built on a single source of truth.',
  },
  {
    icon: ShieldCheck,
    badge: 'Zero-Shock Billing Guard',
    title: 'Hard-Capped Cloud Architecture',
    description:
      'Protected by Cloudflare WAF & Rate Limiting, strict Pydantic payload bounds, per-user resource caps, and fixed-cost containers without auto-scale surprises.',
  },
  {
    icon: Lock,
    badge: 'Defense-in-Depth Auth',
    title: 'Local JWT & Admin RBAC Gate',
    description:
      'Sub-millisecond local HS256 JWT verification eliminating external auth round-trips, paired with strict administrator approval boundaries.',
  },
];

const CORE_COMPETENCIES = [
  'Next.js 14 App Router · TypeScript · Design Atoms (Tone 3 Deep Jade)',
  'FastAPI · SQLAlchemy 2.0 · Alembic Layered Architecture (P/R/C & S1~S8)',
  'Supabase PostgreSQL (Session Pooler :6543) & Local HS256 Verification',
  'Multi-Stage Docker Containers · Cloudflare WAF Cost Safety Guardrails',
];

const TECH_STACK_ITEMS = [
  'Next.js 14',
  'TypeScript',
  'Tailwind CSS',
  'Design Atoms',
  'FastAPI',
  'SQLAlchemy 2.0',
  'Supabase Pooler :6543',
  'Docker Compose',
  'Cloudflare WAF',
  'Alembic',
  'PyJWT HS256',
  'S7 Soft-Delete',
];

const SPEC_CHIPS = [
  { label: 'Local HS256 JWT', dotColor: '#18865b' },
  { label: 'Spend Cap $0', dotColor: '#18865b' },
  { label: 'Session Pooler :6543', dotColor: '#18865b' },
  { label: 'S7 Soft-Delete', dotColor: '#18865b' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6f8] text-[#191f28]">
      {/* 1. 상단 Split Hero + Live Workspace Preview Window */}
      <section className="w-full pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* 좌측 Hero 텍스트 & CTA */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <div className="mb-4">
              <Chip
                tone="primary"
                size="sm"
                className="font-semibold px-3 py-1 bg-[#e6f4ee] text-[#126b48] border-[#b6e2cf]"
              >
                <Sparkles className="h-3 w-3 mr-1 text-[#18865b]" />
                Tone 3 Clean White &amp; Deep Jade #18865B
              </Chip>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight leading-[1.12] mb-5">
              <span className="text-[#191f28]">Crafted for Focus.</span>
              <br />
              <span className="text-[#18865b]">Engineered for Cost Safety.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#4e5968] mb-6 leading-relaxed">
              A personal engineering hub combining Naver Land style crisp whitespace and deep jade
              atoms with zero-shock cloud billing boundaries and sub-millisecond local JWT gates.
            </p>

            {/* 알약형 핵심 스펙 칩 묶음 */}
            <div className="flex flex-wrap gap-2 mb-8">
              {SPEC_CHIPS.map((chipItem) => (
                <Chip
                  key={chipItem.label}
                  tone="neutral"
                  size="sm"
                  dotColor={chipItem.dotColor}
                  className="bg-white border-[#e5e8eb] text-[#333d4b] font-medium shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  {chipItem.label}
                </Chip>
              ))}
            </div>

            {/* CTA 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button
                asChild
                size="default"
                className="w-full sm:w-auto bg-[#18865b] hover:bg-[#136c49] text-white shadow-sm font-semibold"
              >
                <Link href="/todos" className="inline-flex items-center justify-center gap-1.5">
                  Launch Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="default"
                className="w-full sm:w-auto bg-white border-[#e5e8eb] text-[#333d4b] hover:bg-[#f8fafc] hover:border-[#d1d6db]"
              >
                <a href="#architecture" className="inline-flex items-center justify-center gap-1.5">
                  Architecture Guardrails
                </a>
              </Button>
            </div>
          </div>

          {/* 우측 Live Workspace Preview Window */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#e5e8eb] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden">
              {/* 브라우저 크롬 상단 바 */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#f8fafc] border-b border-[#e5e8eb]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="text-[11px] font-mono text-[#8b95a1] bg-white border border-[#e5e8eb] px-3 py-0.5 rounded-md">
                  https://hub.local/todos
                </div>
                <div className="w-10" />
              </div>

              {/* 프리뷰 내부 워크스페이스 상단 필터 바 */}
              <div className="p-4 border-b border-[#e5e8eb] bg-[#ffffff] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Chip tone="primary" active={true} count={12} size="sm">
                      전체
                    </Chip>
                    <Chip tone="neutral" active={false} count={8} size="sm">
                      진행중
                    </Chip>
                    <Chip tone="neutral" active={false} count={3} size="sm">
                      완료
                    </Chip>
                    <Chip tone="danger" active={false} count={1} size="sm">
                      ⚠ 기한지남
                    </Chip>
                  </div>

                  <div className="inline-flex items-center rounded-lg bg-[#f2f4f6] p-0.5 border border-[#e5e8eb] text-[11px] font-medium">
                    <span className="px-2 py-0.5 rounded bg-[#18865b] text-white shadow-sm font-semibold">
                      Month
                    </span>
                    <span className="px-2 py-0.5 text-[#4e5968]">Agenda</span>
                  </div>
                </div>
              </div>

              {/* 프리뷰 내부 미니 캘린더 그리드 */}
              <div className="p-4 bg-white">
                <div className="border border-[#e5e8eb] rounded-xl overflow-hidden bg-white">
                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 border-b border-[#e5e8eb] bg-[#f8fafc] text-[11px] font-semibold text-[#8b95a1] text-center py-1.5">
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span className="text-[#b0b8c1]">SAT</span>
                    <span className="text-[#b0b8c1]">SUN</span>
                  </div>

                  {/* 1주차 샘플 행 */}
                  <div className="grid grid-cols-7 divide-x divide-[#e5e8eb] border-b border-[#e5e8eb] min-h-[58px] bg-white text-xs">
                    <div className="p-1.5 text-[#8b95a1]">20</div>
                    <div className="p-1.5 text-[#8b95a1]">21</div>
                    <div className="p-1.5 text-[#8b95a1]">22</div>
                    <div className="p-1.5">
                      <span className="font-semibold text-[#191f28]">23</span>
                      <div className="mt-1">
                        <span className="block truncate text-[10px] px-1.5 py-0.5 rounded bg-[#f2f4f6] text-[#4e5968] border border-[#e5e8eb]">
                          API 스키마 검증
                        </span>
                      </div>
                    </div>
                    {/* 기간 막대 (Span Bar) */}
                    <div className="col-span-3 p-1.5 bg-[#fcfdfd]">
                      <div className="flex items-center justify-between text-[11px] text-[#4e5968] mb-1">
                        <span className="font-semibold text-[#191f28]">24</span>
                        <span className="text-[10px] text-[#8b95a1]">25~26</span>
                      </div>
                      <div className="px-2 py-1 rounded-md bg-[#e6f4ee] border border-[#b6e2cf] text-[#126b48] text-[11px] font-semibold truncate shadow-xs">
                        🚀 Q4 Cloudflare WAF 배포 (Span)
                      </div>
                    </div>
                  </div>

                  {/* 2주차 샘플 행 */}
                  <div className="grid grid-cols-7 divide-x divide-[#e5e8eb] min-h-[58px] bg-white text-xs">
                    <div className="p-1.5 bg-[#f0f9f5]/50">
                      <div className="flex items-center justify-between">
                        <span className="h-5 w-5 rounded-full bg-[#18865b] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                          27
                        </span>
                        <span className="text-[9px] font-semibold text-[#18865b]">TODAY</span>
                      </div>
                      <div className="mt-1">
                        <span className="block truncate text-[10px] px-1.5 py-0.5 rounded bg-[#fff0f0] text-[#e5484d] border border-[#f8c9c9] font-semibold">
                          ⚠ S7 하니스 완료
                        </span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <span className="font-semibold text-[#191f28]">28</span>
                      <div className="mt-1">
                        <span className="block truncate text-[10px] px-1.5 py-0.5 rounded bg-[#f2f4f6] text-[#8b95a1] line-through">
                          ✓ DB 인덱스 점검
                        </span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <span className="font-semibold text-[#191f28]">29</span>
                    </div>
                    <div className="p-1.5">
                      <span className="font-semibold text-[#191f28]">30</span>
                      <div className="mt-1">
                        <span className="block truncate text-[10px] px-1.5 py-0.5 rounded bg-[#e6f4ee] text-[#126b48] border border-[#b6e2cf]">
                          디자인 시스템 아톰
                        </span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <span className="font-semibold text-[#191f28]">31</span>
                    </div>
                    <div className="p-1.5 text-[#8b95a1]">1</div>
                    <div className="p-1.5 text-[#8b95a1]">2</div>
                  </div>
                </div>

                {/* 하단 미니 Task Peek 요약 스트립 */}
                <div className="mt-3.5 pt-3 border-t border-[#e5e8eb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#191f28]">선택된 날짜 (Today)</span>
                    <Chip tone="danger" size="sm">
                      1건 지남
                    </Chip>
                    <Chip tone="success" size="sm">
                      1건 완료
                    </Chip>
                  </div>
                  <div className="text-[11px] text-[#8b95a1]">
                    단일 소스 PostgreSQL 동기화 · 지연 없는 즉시 토글
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 하단 아키텍처 & 디자인 시스템 요약 섹션 */}
      <section id="architecture" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <Chip tone="primary" size="sm" className="mb-3">
            <ServerCog className="h-3.5 w-3.5 mr-1" />
            System Architecture Guardrails
          </Chip>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#191f28] tracking-tight">
            Built with production cost-safety from day one
          </h2>
          <p className="text-sm sm:text-base text-[#4e5968] mt-2.5 max-w-2xl">
            Every layer is strictly bounded to prevent unexpected cloud billing spikes while keeping
            the user interface snappy, focused, and predictable.
          </p>
        </div>

        {/* 3열 아키텍처 가드레일 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {ARCHITECTURE_HIGHLIGHTS.map((highlightItem) => {
            const IconComponent = highlightItem.icon;
            return (
              <Card
                key={highlightItem.title}
                className="flex flex-col justify-between border-[#e5e8eb] bg-white transition-all duration-200 hover:border-[#18865b]/40 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-lg border border-[#b6e2cf] bg-[#e6f4ee] flex items-center justify-center text-[#18865b]">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-[11px] font-medium border-[#e5e8eb]">
                      {highlightItem.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg text-[#191f28]">
                    {highlightItem.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <CardDescription className="text-xs sm:text-sm leading-relaxed text-[#4e5968]">
                    {highlightItem.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 전체 풀스택 및 기술 스택 아톰 카드 */}
        <Card className="p-6 md:p-8 border-[#e5e8eb] bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <Chip tone="primary" size="sm">
                <Layers className="h-3 w-3 mr-1" />
                Full-Stack Architecture &amp; Atoms
              </Chip>
              <h3 className="text-xl sm:text-2xl font-bold text-[#191f28] leading-snug">
                Reliable digital workspace engineered with clear boundaries.
              </h3>
              <p className="text-xs sm:text-sm text-[#4e5968] leading-relaxed">
                This Personal Hub couples Next.js 14 App Router and a FastAPI service layer backed
                by Supabase PostgreSQL. All user data is strictly isolated per profile, gated by
                administrator approval, and packaged into multi-stage Docker containers ready for
                independent cloud deployment.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {TECH_STACK_ITEMS.map((techName) => (
                  <Chip
                    key={techName}
                    tone="neutral"
                    size="sm"
                    className="bg-[#f2f4f6] text-[#333d4b] border-[#e5e8eb]"
                  >
                    {techName}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-[#e5e8eb] bg-[#f8fafc] p-5 space-y-3.5">
                <div className="text-xs font-bold text-[#18865b] uppercase tracking-wider">
                  Core Engineering Pillars
                </div>
                <ul className="space-y-2.5 text-xs text-[#333d4b]">
                  {CORE_COMPETENCIES.map((competencyText) => (
                    <li key={competencyText} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#18865b] shrink-0 mt-0.5" />
                      <span className="leading-tight">{competencyText}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Button
                    asChild
                    variant="default"
                    className="w-full bg-[#18865b] hover:bg-[#136c49] text-white font-semibold"
                  >
                    <Link
                      href="/todos"
                      className="inline-flex items-center justify-center gap-1.5"
                    >
                      Open Task &amp; Calendar Hub
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
