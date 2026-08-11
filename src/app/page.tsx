import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, Badge } from "@/components/ui/Primitives";
import { Shield, Mail, Users, BarChart3, ChevronRight, Clock } from "lucide-react";
import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";

export default async function Home() {
  const session = await auth();

  await connectDB();
  const latestCourses = await TrainingModule.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

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
            <Link href="/courses" className="hover:text-white transition-colors text-primary-glow">Courses</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {session?.user ? (
              <Link href={session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/student"}>
                <Button variant="primary" size="md" className="whitespace-nowrap px-4 sm:px-6">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="md">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="md" className="whitespace-nowrap px-4 sm:px-6">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-40 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-background to-background opacity-70"></div>



          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 drop-shadow-sm">
            Master Digital <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-glow to-primary filter drop-shadow-md">
              Security Skills
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-text-muted max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Learn to spot cyber threats, defend your personal data, and navigate the internet safely. Your journey to becoming a human firewall starts here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {session?.user ? (
              <Link href={session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/student"}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold tracking-wide">
                  Go to Dashboard <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </section>

        {/* Latest Courses Section */}
        {latestCourses.length > 0 && (
          <section className="py-24 max-w-7xl mx-auto px-6 relative border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">Latest Courses</h2>
                <p className="text-text-muted">Expand your knowledge with our newest modules.</p>
              </div>
              <Link href="/courses">
                <Button variant="ghost" className="gap-2">View all <ChevronRight size={16} /></Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestCourses.map((course: any) => (
                <Link href={`/courses/${course._id}`} key={course._id.toString()}>
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-primary-glow/10 transition-all duration-300 hover:-translate-y-1 group border-border/50 bg-surface/30">
                    <div className="relative w-full aspect-video bg-surface-hover overflow-hidden border-b border-border/50">
                      {course.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.featuredImage}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-border">
                          <Shield size={32} className="opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge tone="neutral" className="bg-background/80 backdrop-blur-md px-2 py-0.5 text-xs">
                          {course.category || "General"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-display font-bold text-lg text-white mb-2 line-clamp-2 leading-tight">
                        {course.title}
                      </h3>
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                          <Clock size={12} />
                          {course.estimatedMinutes} min
                        </div>
                        <span className="text-primary-glow flex items-center gap-0.5 text-xs font-bold group-hover:translate-x-1 transition-transform">
                          Read <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

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
      <footer id="about" className="bg-[#050810] text-text-muted py-16 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <Image src="/assets/logo.png" alt="SecureGuard Logo" width={32} height={32} className="rounded-lg shadow-primary-glow/20 shadow-md" />
              <span className="font-display text-2xl font-bold text-white tracking-tight">SecureGuard</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mt-4">
              Empowering individuals and organizations to build a resilient human firewall through immersive, data-driven security awareness training.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-lg">Product</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/courses" className="hover:text-primary transition-colors w-fit">Courses Catalog</Link>
              <Link href="#features" className="hover:text-primary transition-colors w-fit">Features</Link>
              <Link href="/login" className="hover:text-primary transition-colors w-fit">Login Portal</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-lg">Legal</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="#" className="hover:text-primary transition-colors w-fit">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors w-fit">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors w-fit">Security</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium">
          <p>
            &copy; {new Date().getFullYear()} SecureGuard Inc. All rights reserved.
          </p>
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
