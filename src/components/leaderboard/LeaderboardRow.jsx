import React from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Award, Zap, Flame, BookOpen } from "lucide-react";
import { getLevelFromXP } from "../shared/XPBar";
import BadgeIcon from "../shared/BadgeIcon";

const rankIcons = {
  1: <Crown className="w-5 h-5 text-yellow-400" />,
  2: <Medal className="w-5 h-5 text-slate-300" />,
  3: <Medal className="w-5 h-5 text-amber-600" />,
};

export default function LeaderboardRow({ entry, rank, isCurrentUser, index = 0 }) {
  const level = getLevelFromXP(entry.total_xp || 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        isCurrentUser 
          ? "bg-indigo-500/10 border border-indigo-500/30" 
          : rank <= 3 
            ? "bg-slate-800/60 border border-slate-700/50" 
            : "bg-slate-800/30 border border-transparent hover:border-slate-700/30"
      }`}
    >
      <div className="w-8 flex justify-center">
        {rankIcons[rank] || <span className="text-sm text-slate-500 font-mono">#{rank}</span>}
      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {(entry.user_name || entry.user_email || "?")[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">{entry.user_name || entry.user_email}</span>
          {isCurrentUser && <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full">YOU</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {entry.courses_completed || 0} courses</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {entry.streak_days || 0} day streak</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {entry.badges?.slice(0, 3).map((badge, i) => (
          <BadgeIcon key={i} name={badge} size="sm" />
        ))}
      </div>

      <div className="text-right shrink-0 ml-2">
        <div className="flex items-center gap-1 text-emerald-400 font-bold">
          <Zap className="w-4 h-4" /> {entry.total_xp || 0}
        </div>
        <span className="text-[10px] text-slate-500">LVL {level}</span>
      </div>
    </motion.div>
  );
}