import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
        {/* Background Image / Glow Effects */}
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

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center -mt-20">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium backdrop-blur-md">
            🚀 v2.0 - Next.js + FastAPI Powered
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-6 drop-shadow-lg tracking-tight leading-tight">
            Elevate Your Productivity
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl font-light">
            Welcome to my Personal Hub. A seamless blend of a professional portfolio and a robust, secure task management calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/todos" className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] transform hover:scale-105">
              Launch Calendar
            </a>
            <a href="#about" className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold backdrop-blur-md border border-white/10 transition-all">
              About Me
            </a>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section id="about" className="py-24 bg-[#0a0a0f] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <div className="relative w-full aspect-square max-w-[400px] mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 flex flex-col justify-center shadow-2xl">
                   <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Full-Stack Engineer</h3>
                   <ul className="space-y-4 text-gray-300">
                     <li className="flex items-center gap-3">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm">✓</span>
                       Next.js & React Expert
                     </li>
                     <li className="flex items-center gap-3">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm">✓</span>
                       Python & FastAPI Backend
                     </li>
                     <li className="flex items-center gap-3">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm">✓</span>
                       Cloud & DevOps (Docker)
                     </li>
                     <li className="flex items-center gap-3">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm">✓</span>
                       UI/UX & Atomic Design
                     </li>
                   </ul>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Building digital experiences that matter.</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Hello! I am a passionate software engineer specializing in modern web technologies. This personal hub is a testament to clean architecture, featuring a decoupled Next.js frontend and a highly scalable FastAPI backend powered by Supabase.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Explore my integrated Calendar and Todo system, fortified with Role-Based Access Control and designed with aesthetic precision.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
