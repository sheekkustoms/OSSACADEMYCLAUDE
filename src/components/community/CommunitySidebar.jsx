import React from "react";
import { Pin, Calendar, Trophy, Clock } from "lucide-react";
import moment from "moment";

function SidebarCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function CommunitySidebar({ pinnedPost, upcomingClasses, topContributors, onOpenPost }) {
  return (
    <div className="space-y-4 sticky top-6">
      {/* Pinned Post */}
      {pinnedPost && (
        <SidebarCard title="Pinned Post" icon={Pin}>
          <div
            className="cursor-pointer group"
            onClick={() => onOpenPost?.(pinnedPost)}
          >
            {pinnedPost.image_url && (
              <img src={pinnedPost.image_url} className="w-full h-28 object-cover rounded-xl mb-3" />
            )}
            <p className="font-semibold text-gray-900 text-sm group-hover:text-pink-600 transition-colors leading-snug">
              {pinnedPost.title}
            </p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pinnedPost.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              by {pinnedPost.author_name || pinnedPost.author_email}
            </p>
          </div>
        </SidebarCard>
      )}

      {/* Upcoming Classes */}
      <SidebarCard title="Upcoming Classes" icon={Calendar}>
        {upcomingClasses.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No upcoming classes</p>
        ) : (
          <div className="space-y-3">
            {upcomingClasses.map(cls => (
              <div key={cls.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex flex-col items-center justify-center shrink-0 text-white">
                  <span className="text-[10px] font-bold leading-none">{moment(cls.scheduled_at).format("MMM").toUpperCase()}</span>
                  <span className="text-sm font-bold leading-none">{moment(cls.scheduled_at).format("D")}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{cls.title}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {moment(cls.scheduled_at).local().format("h:mm A")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SidebarCard>

      {/* Top Contributors */}
      <SidebarCard title="Top Contributors" icon={Trophy}>
        {topContributors.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No data yet</p>
        ) : (
          <div className="space-y-3">
            {topContributors.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 text-center shrink-0 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"}`}>
                  #{i + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(p.user_name || p.user_email)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{p.user_name || p.user_email}</p>
                </div>
                <span className="text-xs text-gray-400 font-medium shrink-0">{p.total_xp || 0} XP</span>
              </div>
            ))}
          </div>
        )}
      </SidebarCard>
    </div>
  );
}