import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, Badge } from "@/components/ui/Primitives";
import { Shield, Mail, Users, BarChart3, ChevronRight } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    const redirectPath = session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/student";
    redirect(redirectPath);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-body text-text-main">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image src="/assets/logo.png" alt="SecureGuard Logo" width={32} height={32} className="rounded-lg shadow-primary-glow/20 shadow-md sm:w-9 sm:h-9" />
            <span className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">SecureGuard</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 font-medium text-base text-text-muted">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="md">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="md" className="whitespace-nowrap px-4 sm:px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-40 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-background to-background opacity-70"></div>

          <div className="mb-8 flex justify-center">
            <Badge tone="success" className="px-4 py-1.5 text-sm">Next-Gen Security Platform</Badge>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 drop-shadow-sm">
            Human-Centric <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-glow to-primary filter drop-shadow-md">
              Security Awareness
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-text-muted max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Train students, run hyper-realistic phishing simulations, and measure risk—all from one secure portal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold tracking-wide">
                Start Learning <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto font-bold tracking-wide">
                Login to Portal
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-surface py-32 border-y border-border relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Everything you need to master security</h2>
              <p className="text-xl text-text-muted max-w-2xl mx-auto font-light">Our platform provides enterprise-grade tools designed for modern cybersecurity education.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Mail className="w-8 h-8 text-primary-glow" />}
                title="Realistic Phishing"
                description="Simulate real-world attacks with customizable templates and safe landing pages."
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-primary" />}
                title="Automated Training"
                description="Instantly trigger educational modules and post-course simulation tests."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-warning" />}
                title="Student Profile"
                description="Unlock badges, track your resilience score, and download certificates."
              />
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8 text-danger" />}
                title="Actionable Reports"
                description="Track resilience metrics, risk factors, and progress across all modules."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <Badge tone="info" className="mb-4">Simplified Learning Path</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">How SecureGuard Works</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto font-light">
              Master cybersecurity awareness in three simple, automated steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <StepCard
              step="01"
              title="Learn with Short Lessons"
              description="Complete interactive 5-minute modules covering real phishing tactics, password security, and incident response."
            />
            <StepCard
              step="02"
              title="Test with Real Simulations"
              description="Receive realistic simulated phishing emails in your inbox to test your vigilance under authentic conditions."
            />
            <StepCard
              step="03"
              title="Earn Badges & Certificates"
              description="Build your resilience score, unlock achievement badges, and print shareable certificates of completion."
            />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="about" className="bg-[#050810] text-text-muted py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary-glow" />
            <span className="font-display text-2xl font-bold text-white">SecureGuard</span>
          </div>
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} SecureGuard Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="p-8 flex flex-col items-start hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border/50">
      <div className="p-4 bg-surface-hover rounded-xl mb-6 shadow-inner border border-border/50">
        {icon}
      </div>
      <h3 className="font-display font-bold text-xl text-white mb-3">{title}</h3>
      <p className="text-text-muted text-base leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <Card className="p-8 relative overflow-hidden border-border/60 bg-surface/40 hover:bg-surface/80 transition-all">
      <span className="font-display text-6xl font-extrabold text-primary/10 absolute top-4 right-4 pointer-events-none">
        {step}
      </span>
      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-glow font-bold font-mono-data flex items-center justify-center mb-6">
        {step}
      </div>
      <h3 className="font-display font-bold text-xl text-white mb-3">{title}</h3>
      <p className="text-text-muted text-base leading-relaxed">{description}</p>
    </Card>
  );
}
