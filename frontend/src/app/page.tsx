import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Rocket, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CORE_COMPETENCIES = [
  'Next.js 14 & React TypeScript Architecture',
  'Python FastAPI & SQLAlchemy Layered Backend',
  'Cloudflare WAF · Hard-Capped Cloud Deployment',
  'shadcn/ui & Accessible Design Systems',
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero_bg.png"
            alt="Hero Background"
            fill
            className="object-cover opacity-40 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/80 to-[#0a0a0f]"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center -mt-16">
          <Badge variant="default" className="mb-6 px-3.5 py-1.5 text-sm backdrop-blur-md">
            <Rocket className="h-3.5 w-3.5 mr-1" />
            v2.0 — Next.js + FastAPI + shadcn/ui
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-6 drop-shadow-lg tracking-tight leading-tight">
            Elevate Your Productivity
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl font-light">
            Welcome to my Personal Hub. A seamless blend of a professional portfolio and a robust, cost-safe task management calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="transform hover:scale-105">
              <Link href="/todos">
                <Sparkles className="h-4 w-4" />
                Launch Calendar
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#about">About Me</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-[#0a0a0f] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <div className="relative w-full aspect-square max-w-[420px] mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <Card className="relative w-full h-full flex flex-col justify-center p-2">
                  <CardHeader>
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      Full-Stack Engineer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 text-gray-300">
                      {CORE_COMPETENCIES.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Building digital experiences that matter.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Hello! I am a software engineer specializing in modern web architectures and reliable cloud operations. This Personal Hub combines a decoupled Next.js frontend with a FastAPI backend powered by Supabase.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Explore the integrated Calendar and To-Do system, fortified with Role-Based Access Control, strict payload boundaries, and shadcn/ui components.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
