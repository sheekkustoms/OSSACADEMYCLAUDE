import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Pin, Trash2, Edit2 } from "lucide-react";
import AvatarWithFallback from "@/components/shared/AvatarWithFallback";
import RelativeTime from "@/components/shared/RelativeTime";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const categoryConfig = {
  announcement: { label: "Announcement", bg: "bg-[#E74C3C]/10 text-[#E74C3C]" },
  student_projects: { label: "Win 🏆", bg: "bg-[#2ECC71]/10 text-[#27ae60]" },
  question: { label: "Question", bg: "bg-[#D4AF37]/10 text-[#B8960C]" },
  discussion: { label: "Discussion", bg: "bg-[#111]/5 text-[#444]" },
  resource: { label: "Resource", bg: "bg-[#333]/10 text-[#333]" },
  ask_the_coach: { label: "Ask Coach", bg: "bg-[#D4AF37]/15 text-[#D4AF37]" },
  beginner_help: { label: "Beginner Help", bg: "bg-[#2ECC71]/10 text-[#27ae60]" },
  troubleshooting: { label: "Help", bg: "bg-[#E74C3C]/10 text-[#E74C3C]" },
  showcase: { label: "Showcase", bg: "bg-[#D4AF37]/10 text-[#B8960C]" },
};

export default function CommunityPostCard({ post, currentUser, adminEmails, onLike, onPin, onDelete, onOpen, isAdmin, index = 0 }) {
  const isLiked = post.likes?.includes(currentUser?.email);
  const likeCount = post.likes?.length || 0;
  const isAdminPost = post.is_admin_post || adminEmails?.has(post.author_email);
  const isOwner = post.author_email === currentUser?.email;
  const cat = categoryConfig[post.category] || { label: post.category?.replace(/_/g, " "), bg: "bg-gray-100 text-gray-600" };

  // Fetch live avatar for admin posts
  const { data: liveAdminUser } = useQuery({
    queryKey: ["adminUser", post.author_email],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: post.author_email });
      return users[0] || null;
    },
    enabled: isAdminPost,
    staleTime: 60000,
  });

  const avatarUrl = isAdminPost
    ? (liveAdminUser?.avatar_url || post.author_avatar || null)
    : post.author_avatar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onOpen?.(post)}
    >
      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" />
      )}

      <div className="p-5 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarWithFallback
              imageUrl={avatarUrl}
              name={post.author_name}
              email={post.author_email}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {post.author_name || post.author_email}
                </span>
                {isAdminPost && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold shrink-0">Coach</span>
                )}
                {!isAdminPost && (
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-semibold shrink-0">Student</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                <RelativeTime date={post.created_date} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${cat.bg}`}>
              {cat.label}
            </span>
            {post.is_pinned && (
              <span className="text-[11px] px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full font-medium flex items-center gap-1">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">{post.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{post.content}</p>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-1 pt-2 border-t border-gray-100" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 gap-1.5 text-xs rounded-lg font-medium ${isLiked ? "text-pink-600 bg-pink-50" : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"}`}
            onClick={(e) => { e.stopPropagation(); onLike?.(post); }}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
            {likeCount > 0 ? likeCount : "Like"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-1.5 text-xs rounded-lg font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={(e) => { e.stopPropagation(); onOpen?.(post); }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {post.comment_count > 0 ? `${post.comment_count} Comments` : "Comment"}
          </Button>

          {/* Admin actions */}
          {isAdmin && (
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 rounded-lg ${post.is_pinned ? "text-yellow-600 bg-yellow-50" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"}`}
                title={post.is_pinned ? "Unpin" : "Pin to top"}
                onClick={(e) => { e.stopPropagation(); onPin?.(post); }}
              >
                <Pin className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Delete post"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this post?")) onDelete?.(post);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Owner delete (non-admin) */}
          {!isAdmin && isOwner && (
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                title="Delete post"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this post?")) onDelete?.(post);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}