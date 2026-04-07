'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { Package, Workflow, Users, Filter, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

const FEATURES = [
  {
    icon: Package,
    title: 'Custom Ticket Prefixes',
    description: 'Automatic sequential numbering with custom prefixes like FM-0001.',
  },
  {
    icon: Workflow,
    title: 'Advanced Workflow',
    description: 'Seamless transitions from To Do → In Progress → In Review → Done.',
  },
  {
    icon: Users,
    title: 'Granular Roles',
    description: 'Owner, Editor, and Viewer permissions for complete access control.',
  },
  {
    icon: Filter,
    title: 'Real-time Filtering',
    description: 'Search by status, priority (Low to Critical), and assignee instantly.',
  },
];

const TECH_STACK = [
  { name: 'Next.js 16', description: 'App Router, React 19' },
  { name: 'Prisma', description: 'Type-safe ORM' },
  { name: 'PostgreSQL', description: 'Reliable database' },
  { name: 'Clerk', description: 'Authentication' },
];

export default function LandingPage() {
  const { user } = useUser();

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="relative h-10 w-36">
              <Image src="/logo2.png" alt="Taskflow" fill className="object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#tech" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Tech Stack
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-medium bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md transition-all hover:shadow-lg hover:shadow-indigo-500/25">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="landing-animate text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-slate-900 dark:text-white leading-tight">
              The Jira experience.{' '}
              <span className="text-[#4f46e5]">Without the bloat.</span>
            </h1>
            <p className="landing-animate-delay-1 mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400">
              A high-performance task management tool optimized for speed and developer experience.{' '}
              Built for teams that value efficiency over complexity.
            </p>
            <div className="landing-animate-delay-2 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium px-6 py-3 rounded-md transition-all hover:shadow-lg hover:shadow-indigo-500/25">
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
              <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium px-6 py-3 rounded-md transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                See how it works
              </a>
            </div>
          </div>

          {/* Dashboard Screenshot Placeholder */}
          <div className="landing-animate-delay-3 mt-16">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-transparent to-slate-50 dark:to-slate-900/50 pointer-events-none" />
              <div className="aspect-[16/9] flex items-center justify-center">
                <img src="/dashboard_screenshot.png" alt="Dashboard Preview" className="w-full h-full object-fill" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-slate-900 dark:text-white">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features wrapped in a clean, intuitive interface.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`landing-animate-delay-${index + 1} bg-white dark:bg-[#1e293b] p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#4f46e5]/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10`}
              >
                <div className="w-12 h-12 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#4f46e5]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-slate-900 dark:text-white">
              Built with modern tools
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Powering your workflow with cutting-edge technology
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TECH_STACK.map((tech, index) => (
              <div
                key={tech.name}
                className={`landing-animate-delay-${index + 1} flex flex-col items-center justify-center p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b]`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-[#4f46e5]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {tech.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-6">
            Ready to streamline your workflow?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of teams who&apos;ve switched to a simpler, faster way to manage tasks.
          </p>
          <SignUpButton mode="modal">
            <button className="inline-flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium px-8 py-4 rounded-md transition-all hover:shadow-lg hover:shadow-indigo-500/25 text-lg">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 Taskflow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
