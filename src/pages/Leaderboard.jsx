import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Zap, Crown, Medal, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeaderboardRow from "../components/leaderboard/LeaderboardRow";
import { getLevelFromXP } from "../components/shared/XPBar";
import BadgeIcon from "../components/shared/BadgeIcon";

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => base44.entities.UserPoints.list("-total_xp", 100),
  });

  const topThree = allUsers.slice(0, 3);
  const rest = allUsers.slice(3);

  const myRank = allUsers.findIndex((u) => u.user_email === user?.email) + 1;
  const myEntry = allUsers.find((u) => u.user_email === user?.email);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" /> Leaderboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">Compete with fellow learners and climb the ranks</p>
      </div>

      {/* Your rank card */}
      {myEntry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                #{myRank}
              </div>
              <div>
                <p className="text-white font-semibold">Your Ranking</p>
                <p className="text-sm text-slate-400">Level {getLevelFromXP(myEntry.total_xp || 0)} · {myEntry.streak_days || 0} day streak</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-xl">
                  <Zap className="w-5 h-5" /> {myEntry.total_xp || 0}
                </div>
                <span className="text-xs text-slate-400">Total XP</span>
              </div>
              {myEntry.badges?.length > 0 && (
                <div className="flex gap-1">
                  {myEntry.badges.slice(0, 4).map((badge) => (
                    <BadgeIcon key={badge} name={badge} size="sm" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Podium for top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 items-end">
          {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
            const rank = [2, 1, 3][i];
            const heights = ["h-28", "h-36", "h-24"];
            const colors = [
              "from-slate-400 to-slate-500",
              "from-amber-400 to-yellow-500",
              "from-amber-700 to-amber-800",
            ];
            const icons = [Medal, Crown, Medal];
            const Icon = icons[i];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mb-2 border-2 border-slate-700">
                  {(entry.user_name || entry.user_email || "?")[0].toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-white text-center truncate max-w-full mb-1">
                  {entry.user_name || entry.user_email}
                </p>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-2">
                  <Zap className="w-3 h-3" /> {entry.total_xp || 0}
                </div>
                <div className={`w-full ${heights[i]} bg-gradient-to-t ${colors[i]} rounded-t-xl flex items-start justify-center pt-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {rest.map((entry, i) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={i + 4}
              isCurrentUser={entry.user_email === user?.email}
              index={i}
            />
          ))}
        </div>
      )}

      {allUsers.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No learners yet</p>
          <p className="text-sm text-slate-500 mt-1">Start learning to get on the board!</p>
        </div>
      )}
    </div>
  );
}