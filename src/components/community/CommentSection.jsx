import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { awardXP } from "../shared/useUserPoints";

export default function CommentSection({ postId, user, myPoints }) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => base44.entities.Comment.filter({ post_id: postId }),
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Comment.create({
        post_id: postId,
        author_email: user.email,
        author_name: user.full_name || user.email,
        content: newComment,
        likes: [],
      });
      // Update comment count on post
      const posts = await base44.entities.CommunityPost.filter({ id: postId });
      if (posts[0]) {
        await base44.entities.CommunityPost.update(postId, {
          comment_count: (posts[0].comment_count || 0) + 1,
        });
      }
      if (myPoints) {
        await awardXP(myPoints.id, myPoints, 5, {
          comments_made: (myPoints.comments_made || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myPointsCommunity"] });
      queryClient.invalidateQueries({ queryKey: ["myPoints"] });
      setNewComment("");
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (comment) => {
      const likes = [...(comment.likes || [])];
      const idx = likes.indexOf(user.email);
      if (idx > -1) likes.splice(idx, 1);
      else likes.push(user.email);
      await base44.entities.Comment.update(comment.id, { likes });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", postId] }),
  });

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white">Comments ({comments.length})</h4>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {comments.map((comment, i) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-slate-800/60 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300">{comment.author_name || comment.author_email}</span>
              <span className="text-[10px] text-slate-500">{moment(comment.created_date).fromNow()}</span>
            </div>
            <p className="text-sm text-slate-400">{comment.content}</p>
            <button
              onClick={() => likeCommentMutation.mutate(comment)}
              className={`flex items-center gap-1 mt-2 text-xs ${
                comment.likes?.includes(user?.email) ? "text-pink-400" : "text-slate-500 hover:text-pink-400"
              } transition-colors`}
            >
              <Heart className={`w-3 h-3 ${comment.likes?.includes(user?.email) ? "fill-current" : ""}`} />
              {comment.likes?.length || 0}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment... (+5 XP)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-slate-800/50 border-slate-700/50 text-white min-h-[60px] text-sm"
        />
        <Button
          onClick={() => addCommentMutation.mutate()}
          disabled={!newComment.trim() || addCommentMutation.isPending}
          size="icon"
          className="bg-indigo-600 hover:bg-indigo-700 shrink-0 self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}