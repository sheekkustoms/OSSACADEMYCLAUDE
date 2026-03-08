import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Zap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryGradients = {
  development: "from-blue-600 to-indigo-700",
  design: "from-pink-600 to-rose-700",
  marketing: "from-amber-500 to-orange-600",
  business: "from-emerald-600 to-green-700",
  data_science: "from-violet-600 to-purple-700",
  personal_development: "from-cyan-500 to-teal-600",
};

const difficultyColors = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function CourseCard({ course, enrollment, index = 0 }) {
  const gradient = categoryGradients[course.category] || "from-slate-600 to-slate-700";
  const progress = enrollment?.progress_percent || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl("CourseDetail") + `?id=${course.id}`}>
        <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
          <div className={`h-36 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge className={`${difficultyColors[course.difficulty]} border text-[10px] uppercase tracking-wider`}>
                {course.difficulty}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" /> +{course.xp_reward} XP
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{course.title}</h3>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course.description}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" /> {course.lesson_count || 0} lessons
              </span>
              <span className="capitalize text-slate-400">{course.category?.replace(/_/g, " ")}</span>
            </div>

            {enrollment && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-indigo-400 font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}