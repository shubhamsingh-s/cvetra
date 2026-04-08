"use client";

import { motion, Variants } from "framer-motion";
import { GraduationCap, Briefcase, Rocket } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [hoveredRole, setHoveredRole] = useState<"student" | "recruiter" | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const shapeVariants: Variants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 10, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground text-foreground">
      <ModeToggle />

      {/* Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={shapeVariants}
          animate="animate"
          className="absolute -top-[10%] -left-[5%] w-[40vw] h-[40vw] bg-blue-500/10 blur-[120px] rounded-full"
        />
        <motion.div
          variants={shapeVariants}
          animate="animate"
          className="absolute -bottom-[10%] -right-[5%] w-[40vw] h-[40vw] bg-purple-500/10 blur-[120px] rounded-full"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col md:flex-row min-h-screen"
      >
        {/* Logo/Header (Centered) */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 text-center">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <div className="p-2.5 bg-foreground/5 rounded-xl glass">
              <Rocket className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              TALENT<span className="text-blue-500">VERSE</span>
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em]"
          >
            AI Talent Intelligence & Strategy Engine
          </motion.p>
        </div>

        {/* Student Section */}
        <motion.div
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center transition-all duration-700 ease-in-out cursor-pointer group",
            hoveredRole === "recruiter" ? "md:flex-[0.7]" : "md:flex-[1.3]",
            hoveredRole === "student" ? "bg-blue-500/5" : "bg-transparent"
          )}
          onMouseEnter={() => setHoveredRole("student")}
          onMouseLeave={() => setHoveredRole(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-20 flex flex-col items-center text-center px-12 pt-24 md:pt-0">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="mb-8 p-8 rounded-3xl bg-blue-500/10 glass shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_60px_-12px_rgba(59,130,246,0.5)] transition-all duration-500"
            >
              <GraduationCap className="w-16 h-16 text-blue-500" />
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              I'm a <span className="text-blue-500">Student</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-10 max-w-sm leading-relaxed">
              Launch your career with AI-powered resume analysis, mock interviews, and personalized roadmaps.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link
                href="/auth/register?role=student"
                className="inline-block px-10 py-4 rounded-2xl bg-blue-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:bg-blue-500 transition-all duration-300"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Vertical Divider (Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-1/4 bottom-1/4 w-px bg-border/40 -translate-x-1/2 z-30" />

        {/* Recruiter Section */}
        <motion.div
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center transition-all duration-700 ease-in-out cursor-pointer group border-t md:border-t-0 md:border-l border-border/20",
            hoveredRole === "student" ? "md:flex-[0.7]" : "md:flex-[1.3]",
            hoveredRole === "recruiter" ? "bg-slate-900/40" : "bg-transparent"
          )}
          onMouseEnter={() => setHoveredRole("recruiter")}
          onMouseLeave={() => setHoveredRole(null)}
        >
          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-20 flex flex-col items-center text-center px-12 py-24 md:py-0">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="mb-8 p-8 rounded-3xl bg-slate-600/10 glass border-slate-700/50 shadow-[0_0_50px_-12px_rgba(30,41,59,0.3)] group-hover:shadow-[0_0_60px_-12px_rgba(30,41,59,0.5)] transition-all duration-500"
            >
              <Briefcase className="w-16 h-16 text-slate-400 group-hover:text-white transition-colors duration-500" />
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              I'm a <span className="text-slate-400 group-hover:text-white transition-colors duration-500">Recruiter</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-10 max-w-sm leading-relaxed">
              Find the perfect match with automated talent intelligence, predictive scoring, and strategic insights.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link
                href="/auth/register?role=recruiter"
                className="inline-block px-10 py-4 rounded-2xl bg-slate-800 text-white font-semibold text-lg border border-slate-600/50 shadow-lg shadow-black/20 hover:bg-slate-700 transition-all duration-300"
              >
                Hire Talent
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer (Floating) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 text-xs text-muted-foreground font-medium opacity-60">
        &copy; 2026 Talentverse Inc. &bull; Privacy &bull; Terms
      </div>
    </main>
  );
}
