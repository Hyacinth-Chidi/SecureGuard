import Link from "next/link";
import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";
import { Card, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Clock, Shield } from "lucide-react";
import Image from "next/image";

// Force dynamic to ensure fresh data for now
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  await connectDB();

  const courses = await TrainingModule.find({ published: true })
    .sort({ createdAt: -1 })
    .lean();

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
            <Link href="/dashboard/student">
              <Button variant="ghost" size="md">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16 w-full">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Cybersecurity Courses
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto font-light">
            Browse our library of security awareness modules. Sign in to take quizzes and earn your certificates.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-border mx-auto mb-4" />
            <p className="text-text-muted">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <Link href={`/courses/${course._id}`} key={course._id.toString()}>
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-primary-glow/10 transition-all duration-300 hover:-translate-y-1 group border-border/50 bg-surface/30">
                  {/* Featured Image */}
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
                        <Shield size={48} className="opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge tone="neutral" className="bg-background/80 backdrop-blur-md">
                        {course.category || "General"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-display font-bold text-xl text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {course.summary}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                        <Clock size={14} />
                        {course.estimatedMinutes} min read
                      </div>
                      <span className="text-primary-glow flex items-center gap-1 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Read <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
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
