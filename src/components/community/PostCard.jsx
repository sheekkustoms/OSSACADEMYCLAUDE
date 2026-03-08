import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Clock } from "lucide-react";
import moment from "moment";

const categoryStyles = {
  discussion: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  question: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  showcase: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  resource: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  announcement: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function PostCard({ post, currentUserEmail, onLike, onClick, index = 0 }) {
  const isLiked = post.likes?.includes(currentUserEmail);
  const likeCount = post.likes?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="group bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-500/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${categoryStyles[post.category]} border text-[10px] uppercase tracking-wider`}>
              {post.category}
            </Badge>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {moment(post.created_date).fromNow()}
            </span>
          </div>
          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{post.title}</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{post.content}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-slate-500">by <span className="text-slate-300">{post.author_name || post.author_email}</span></span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700/30">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 gap-1.5 text-xs ${isLiked ? "text-pink-400 hover:text-pink-300" : "text-slate-400 hover:text-white"}`}
          onClick={(e) => { e.stopPropagation(); onLike(post); }}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
          {likeCount}
        </Button>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MessageCircle className="w-3.5 h-3.5" />
          {post.comment_count || 0}
        </div>
      </div>
    </motion.div>
  );
}