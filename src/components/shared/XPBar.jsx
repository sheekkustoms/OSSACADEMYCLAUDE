import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];

export function getLevelFromXP(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXPForNextLevel(xp) {
  const level = getLevelFromXP(xp);
  if (level >= LEVEL_THRESHOLDS.length) return { current: xp, needed: xp, percent: 100 };
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1];
  const nextLevelXP = LEVEL_THRESHOLDS[level];
  const progress = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current: progress, needed, percent: Math.round((progress / needed) * 100) };
}

export default function XPBar({ xp = 0, showLevel = true, compact = false }) {
  const level = getLevelFromXP(xp);
  const { current, needed, percent } = getXPForNextLevel(xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
          <Zap className="w-3.5 h-3.5" />
          {xp} XP
        </div>
        <span className="text-xs text-slate-400">Lvl {level}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showLevel && (
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              LVL {level}
            </span>
          )}
          <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> {xp} XP
          </span>
        </div>
        <span className="text-xs text-slate-400">{current}/{needed} to next level</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}