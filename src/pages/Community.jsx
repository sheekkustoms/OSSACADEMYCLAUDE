import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MessageCircle, Search, Users } from "lucide-react";
import PostCard from "../components/community/PostCard";
import CommentSection from "../components/community/CommentSection";
import { getOrCreateUserPoints, awardXP } from "../components/shared/useUserPoints";

const CATEGORIES = ["all", "discussion", "question", "showcase", "resource", "announcement"];

export default function Community() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "discussion" });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 50),
  });

  const { data: myPoints } = useQuery({
    queryKey: ["myPointsCommunity", user?.email],
    queryFn: () => getOrCreateUserPoints(user),
    enabled: !!user?.email,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CommunityPost.create({
        ...newPost,
        author_email: user.email,
        author_name: user.full_name || user.email,
        likes: [],
        comment_count: 0,
      });
      if (myPoints) {
        await awardXP(myPoints.id, myPoints, 15, {
          posts_created: (myPoints.posts_created || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myPointsCommunity"] });
      queryClient.invalidateQueries({ queryKey: ["myPoints"] });
      setShowCreateDialog(false);
      setNewPost({ title: "", content: "", category: "discussion" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const likes = [...(post.likes || [])];
      const idx = likes.indexOf(user.email);
      if (idx > -1) likes.splice(idx, 1);
      else likes.push(user.email);
      await base44.entities.CommunityPost.update(post.id, { likes });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
  });

  const filtered = posts.filter((p) => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-sm text-slate-400 mt-1">Connect, share, and learn together</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              className={`cursor-pointer capitalize transition-colors ${
                category === cat
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "text-slate-500 border-slate-700/40 hover:text-slate-300"
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <div key={i} className="bg-slate-800/40 rounded-xl h-32 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No posts yet</p>
          <p className="text-sm text-slate-500 mt-1">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserEmail={user?.email}
              onLike={(p) => likeMutation.mutate(p)}
              onClick={() => setSelectedPost(post)}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Create post dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-700/50 text-white">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="bg-slate-800/50 border-slate-700/50 text-white"
            />
            <Textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="bg-slate-800/50 border-slate-700/50 text-white min-h-[120px]"
            />
            <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="showcase">Showcase</SelectItem>
                <SelectItem value="resource">Resource</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button
                onClick={() => createPostMutation.mutate()}
                disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Post (+15 XP)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post detail with comments */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPost.title}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-400 mb-4">{selectedPost.content}</p>
              <p className="text-xs text-slate-500 mb-4">
                by {selectedPost.author_name || selectedPost.author_email} · {new Date(selectedPost.created_date).toLocaleDateString()}
              </p>
              <CommentSection postId={selectedPost.id} user={user} myPoints={myPoints} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}