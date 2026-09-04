import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";
import Template from "@/lib/models/Template";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Primitives";
import { ChevronLeft, Clock, Calendar, Shield, Award } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CourseQuiz } from "./CourseQuiz";
import { InteractiveSimulationLab, SimulationTemplateData } from "@/components/dashboard/InteractiveSimulationLab";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getYouTubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const course = await TrainingModule.findOne({ _id: id, published: true }).lean();
  
  if (!course) {
    notFound();
  }

  let simulationTemplate: any = null;
  if (course.simulationTemplateId) {
    simulationTemplate = await Template.findById(course.simulationTemplateId)
      .select("name fromName fromEmail subject htmlBody landingType landingHeadline landingBody redFlags")
      .lean();
  }

  const safeTemplate: SimulationTemplateData | null = simulationTemplate ? {
    _id: simulationTemplate._id.toString(),
    name: simulationTemplate.name,
    fromName: simulationTemplate.fromName,
    fromEmail: simulationTemplate.fromEmail,
    subject: simulationTemplate.subject,
    htmlBody: simulationTemplate.htmlBody,
    landingType: simulationTemplate.landingType,
    landingHeadline: simulationTemplate.landingHeadline,
    landingBody: simulationTemplate.landingBody,
    redFlags: simulationTemplate.redFlags,
  } : null;

  const session = await auth();
  const youtubeId = getYouTubeId(course.videoUrl);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body text-text-main pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image src="/assets/logo.png" alt="SecureGuard Logo" width={32} height={32} className="rounded-lg shadow-primary-glow/20 shadow-md sm:w-9 sm:h-9" />
            <span className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">SecureGuard</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 font-medium text-base text-text-muted">
            <Link href="/courses" className="hover:text-white transition-colors text-primary-glow">Courses</Link>
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/#about" className="hover:text-white transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {session?.user ? (
              <Link href={session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/student"}>
                <Button variant="ghost" size="md">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="md">Log in to track progress</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 w-full">
        <Link href="/courses" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8">
          <ChevronLeft size={16} /> Back to all courses
        </Link>

        {/* Article Header */}
        <div className="mb-10 text-center">
          <Badge tone="info" className="mb-6">{course.category || "General"}</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
            {course.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-text-muted text-sm font-medium">
            <span className="flex items-center gap-2"><Clock size={16} /> {course.estimatedMinutes} min read</span>
            <span className="flex items-center gap-2"><Calendar size={16} /> {formatDate(course.createdAt)}</span>
          </div>
        </div>

        {/* Featured Image */}
        {course.featuredImage ? (
          <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12 border border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.featuredImage} alt={course.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[21/9] rounded-3xl bg-surface/50 border border-border/50 flex items-center justify-center mb-12 text-border">
            <Shield size={64} className="opacity-30" />
          </div>
        )}

        {/* Video Embedding */}
        {youtubeId && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-lg mb-12">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        )}

        {/* Markdown Content */}
        <article className="prose prose-invert prose-blue max-w-none prose-headings:font-display prose-headings:font-bold prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {course.content}
          </ReactMarkdown>
        </article>

        {/* Hands-on Interactive Threat Simulation Lab */}
        {safeTemplate && (
          <InteractiveSimulationLab template={safeTemplate} />
        )}

        {/* Quiz Section */}
        {course.quiz && course.quiz.length > 0 && (
          <div className="mt-16">
            {session?.user ? (
              <CourseQuiz moduleId={course._id.toString()} quizData={course.quiz} />
            ) : (
              <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-surface border border-primary/20 text-center">
                <Award size={48} className="mx-auto text-primary-glow mb-4" />
                <h3 className="font-display text-2xl font-bold text-white mb-3">Earn your certificate</h3>
                <p className="text-text-muted mb-6 max-w-lg mx-auto">
                  Ready to test your knowledge? Sign in or create a free account to take the quiz and earn a verifiable certificate of completion.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/login"><Button variant="primary" size="lg">Log In</Button></Link>
                  <Link href="/signup"><Button variant="ghost" size="lg">Sign Up</Button></Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#050810] text-text-muted py-16 border-t border-border mt-auto">
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
              <Link href="/#features" className="hover:text-primary transition-colors w-fit">Features</Link>
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
