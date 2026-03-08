import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Flame, Target, ArrowRight, Zap, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import XPBar from "../components/shared/XPBar";
import BadgeIcon from "../components/shared/BadgeIcon";
import CourseCard from "../components/shared/CourseCard";
import { getOrCreateUserPoints } from "../components/shared/useUserPoints";

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: myPoints } = useQuery({
    queryKey: ["dashboardPoints", user?.email],
    queryFn: () => getOrCreateUserPoints(user),
    enabled: !!user?.email,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["myEnrollments", user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["allCourses"],
    queryFn: () => base44.entities.Course.filter({ is_published: true }),
  });

  const { data: topLearners = [] } = useQuery({
    queryKey: ["topLearners"],
    queryFn: () => base44.entities.UserPoints.list("-total_xp", 5),
  });

  const enrolledCourseIds = enrollments.map((e) => e.course_id);
  const inProgressCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const recommendedCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id)).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Welcome back, {user?.full_name?.split(" ")[0] || "Learner"} 👋
          </h1>
          <p className="text-indigo-200 text-sm mb-5">Keep up the great work! You're on a learning streak.</p>
          <div className="max-w-md">
            <XPBar xp={myPoints?.total_xp || 0} />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Courses Completed" value={myPoints?.courses_completed || 0} color="from-blue-500 to-indigo-600" delay={0.1} />
        <StatCard icon={Target} label="Lessons Done" value={myPoints?.lessons_completed || 0} color="from-emerald-500 to-green-600" delay={0.15} />
        <StatCard icon={Flame} label="Day Streak" value={myPoints?.streak_days || 0} color="from-orange-500 to-red-500" delay={0.2} />
        <StatCard icon={Star} label="Badges Earned" value={myPoints?.badges?.length || 0} color="from-amber-500 to-yellow-500" delay={0.25} />
      </div>

      {/* Badges */}
      {myPoints?.badges?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Your Badges</h2>
          <div className="flex flex-wrap gap-4">
            {myPoints.badges.map((badge) => (
              <BadgeIcon key={badge} name={badge} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Continue learning */}
      {inProgressCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
            <Link to={createPageUrl("Courses")} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCourses.slice(0, 3).map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollments.find((e) => e.course_id === course.id)}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended */}
      {recommendedCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
            <Link to={createPageUrl("Courses")} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Browse all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCourses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Mini leaderboard */}
      {topLearners.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Top Learners
            </h2>
            <Link to={createPageUrl("Leaderboard")} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Full leaderboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl divide-y divide-slate-700/30">
            {topLearners.map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-center text-sm font-bold text-slate-500">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {(entry.user_name || entry.user_email || "?")[0].toUpperCase()}
                </div>
                <span className="flex-1 text-sm text-white truncate">{entry.user_name || entry.user_email}</span>
                <span className="text-sm text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> {entry.total_xp || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}