import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Lock,
  ServerCog,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ARCHITECTURE_HIGHLIGHTS = [
  {
    icon: CalendarCheck2,
    badge: 'Productivity Workspace',
    title: 'Synchronized To-Do & Calendar',
    description:
      'Manage daily tasks with priority levels, instant completion toggles, and real-time monthly calendar visualization.',
  },
  {
    icon: ShieldCheck,
    badge: 'Zero-Shock Billing Guard',
    title: 'Hard-Capped Cloud Architecture',
    description:
      'Protected by Cloudflare WAF & Rate Limiting, strict Pydantic payload bounds, per-user resource caps, and fixed-cost containers.',
  },
  {
    icon: Lock,
    badge: 'Defense-in-Depth Auth',
    title: 'Local JWT & Admin RBAC Gate',
    description:
      'Sub-millisecond local HS256 JWT verification without external auth bottlenecks, paired with admin approval access control.',
  },
];

const CORE_COMPETENCIES = [
  'Next.js 14 App Router · TypeScript · shadcn/ui Design System',
  'FastAPI · SQLAlchemy 2.0 · Alembic Layered Backend',
  'Supabase PostgreSQL (Session Pooler :6543) & OAuth/Email Auth',
  'Multi-Stage Docker Containers · Cloudflare WAF Cost Safety',
];

const TECH_STACK_BADGES = [
  'Next.js 14',
  'TypeScript',
  'Tailwind CSS',
  'shadcn/ui',
  'FastAPI',
  'SQLAlchemy 2.0',
  'Supabase',
  'Docker Compose',
  'Cloudflare WAF',
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-subtle-grid">
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero_bg.png"
            alt="Hero Background"
            fill
            className="object-cover opacity-20 blur-[3px] mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070c0a]/60 via-[#070c0a]/85 to-[#070c0a]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[340px] rounded-full bg-[#8ee3be]/15 blur-[130px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <Badge variant="default" className="mb-6 px-4 py-1.5 text-xs tracking-wide backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#8ee3be]" />
            v2.0 — Pastel Green Edition · Next.js + FastAPI + Docker
          </Badge>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 max-w-4xl">
            <span className="text-white">Crafted for Focus.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d8f9e9] via-[#8ee3be] to-[#6ee7b7]">
              Engineered for Cost Safety.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/70 mb-10 max-w-2xl leading-relaxed font-normal">
            A personal engineering hub and task calendar combining accessible <span className="text-[#a7f3d0] font-medium">shadcn/ui</span> craft with hard-capped, production-ready cloud security boundaries.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/todos">
                Launch Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px]">
              <a href="#architecture">Explore Architecture</a>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full max-w-4xl text-left">
            <div className="rounded-2xl border border-emerald-200/10 bg-[#0c1411]/75 p-4 backdrop-blur-xl">
              <div className="text-xs text-emerald-200/60 font-medium mb-1">JWT Verification</div>
              <div className="text-xl font-bold text-[#a7f3d0]">Local HS256</div>
              <div className="text-xs text-emerald-100/50 mt-0.5">0 external auth calls/req</div>
            </div>
            <div className="rounded-2xl border border-emerald-200/10 bg-[#0c1411]/75 p-4 backdrop-blur-xl">
              <div className="text-xs text-emerald-200/60 font-medium mb-1">Billing Protection</div>
              <div className="text-xl font-bold text-[#a7f3d0]">Hard-Capped</div>
              <div className="text-xs text-emerald-100/50 mt-0.5">No unbounded auto-scale</div>
            </div>
            <div className="rounded-2xl border border-emerald-200/10 bg-[#0c1411]/75 p-4 backdrop-blur-xl">
              <div className="text-xs text-emerald-200/60 font-medium mb-1">Database Pooler</div>
              <div className="text-xl font-bold text-[#a7f3d0]">Port :6543</div>
              <div className="text-xs text-emerald-100/50 mt-0.5">Bounded SQLAlchemy pool</div>
            </div>
            <div className="rounded-2xl border border-emerald-200/10 bg-[#0c1411]/75 p-4 backdrop-blur-xl">
              <div className="text-xs text-emerald-200/60 font-medium mb-1">Container Stack</div>
              <div className="text-xl font-bold text-[#a7f3d0]">Multi-Stage</div>
              <div className="text-xs text-emerald-100/50 mt-0.5">Dev reload &amp; Prod standalone</div>
            </div>
          </div>
        </div>
      </section>

      <section id="architecture" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <Badge variant="secondary" className="mb-3">
            <ServerCog className="h-3.5 w-3.5" />
            System Architecture
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Built with production guardrails from day one
          </h2>
          <p className="text-emerald-100/60 mt-3 max-w-2xl">
            Every layer is designed to prevent surprise cloud billing spikes while keeping daily task management fast and intuitive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARCHITECTURE_HIGHLIGHTS.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={item.title}
                className="group hover:border-[#8ee3be]/35 transition-all duration-300 flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl border border-[#8ee3be]/30 bg-[#8ee3be]/12 flex items-center justify-center text-[#8ee3be] group-hover:scale-105 transition-transform">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">{item.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-[#a7f3d0] transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-emerald-100/65">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="about" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <Card className="p-2 md:p-6 relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-[#8ee3be]/10 blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-4 md:p-6">
            <div className="lg:col-span-7 space-y-5">
              <Badge variant="default">Full-Stack &amp; Cloud Architecture</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Building reliable digital workspaces with clear security boundaries.
              </h2>
              <p className="text-emerald-100/70 leading-relaxed">
                This Personal Hub integrates a Next.js 14 frontend and a FastAPI service layer backed by Supabase PostgreSQL. All user data is strictly isolated per profile, gated by administrator approval, and packaged in multi-stage Docker containers ready for cloud deployment.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {TECH_STACK_BADGES.map((tech) => (
                  <Badge key={tech} variant="outline" className="px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#8ee3be]/20 bg-[#070c0a]/80 p-6 space-y-4">
                <div className="text-sm font-semibold text-[#a7f3d0] uppercase tracking-wider">
                  Core Engineering Pillars
                </div>
                <ul className="space-y-3.5 text-sm text-emerald-50/90">
                  {CORE_COMPETENCIES.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-[#8ee3be] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/todos">
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
