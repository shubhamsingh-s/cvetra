"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Clock, MapPin, Search, Filter, Rocket, CheckCircle2 } from "lucide-react";
import { jobs as jobsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await jobsApi.list();
        setJobs(data.jobs || []);
      } catch (e) {
        console.error("API error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAppliedJobs(prev => new Set(prev).add(jobId));
    setApplyingId(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-500" />
               </div>
               <h1 className="text-4xl font-black tracking-tight">Open <span className="text-blue-500">Opportunities</span></h1>
            </div>
            <p className="text-muted-foreground">Discover roles that match your skill set and career aspirations.</p>
          </div>
          
          {user?.role === "recruiter" && (
            <Link 
                href="/dashboard/recruiter/postjob" 
                className="inline-flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all hover:-translate-y-1"
            >
                <Plus className="w-5 h-5" />
                Post New Job
            </Link>
          )}
        </header>

        <div className="grid gap-6">
          {loading ? (
            <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                     <div key={i} className="h-32 glass rounded-3xl animate-pulse" />
                 ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass rounded-[2rem] p-16 border border-white/10 text-center">
                 <div className="inline-flex p-4 bg-foreground/5 rounded-2xl mb-4">
                      <Search className="w-8 h-8 text-muted-foreground opacity-30" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">No jobs found</h3>
                 <p className="text-muted-foreground">Check back later for new opportunities or refine your search.</p>
            </div>
          ) : (
            jobs.map((j) => (
              <div key={j._id}>
                <div className="glass group rounded-[2rem] p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-blue-500/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                         <h3 className="text-2xl font-bold group-hover:text-blue-500 transition-colors">{j.title}</h3>
                         <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Active</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
                        {j.description || "No description provided for this role. Click to learn more about the requirements and benefits."}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground">
                         <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                             <MapPin className="w-4 h-4 text-blue-500" />
                             <span>{j.location || "Remote"}</span>
                         </div>
                         <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                             <Clock className="w-4 h-4 text-purple-500" />
                             <span>{new Date(j.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                         </div>
                         <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                             <Briefcase className="w-4 h-4 text-orange-500" />
                             <span>{j.experienceRequired}y+ Experience</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                         <Link 
                            href={`/upload?jobId=${j._id}`}
                            className="w-full sm:w-auto px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-white/10 rounded-xl font-bold text-sm transition-all text-center"
                         >
                            AI Quick Scan
                         </Link>
                         <button 
                            onClick={() => handleApply(j._id)}
                            disabled={appliedJobs.has(j._id) || applyingId === j._id}
                            className={cn(
                                "w-full sm:w-auto px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2",
                                appliedJobs.has(j._id) 
                                    ? "bg-green-500/20 text-green-500 border border-green-500/30 cursor-default" 
                                    : "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                            )}
                         >
                            {applyingId === j._id ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Applying...</span>
                                </>
                            ) : appliedJobs.has(j._id) ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Applied</span>
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-4 h-4" />
                                    <span>Apply Now</span>
                                </>
                            )}
                         </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>

  );
}

// Add a simple wrapper for lack of framer-motion direct support in write_to_file without complexity
function motion_wrapper({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}
