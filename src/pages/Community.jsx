import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CommunityFeed from "../components/community/CommunityFeed";
import CommunitySidebar from "../components/community/CommunitySidebar";
import PostComposer from "../components/community/PostComposer";
import CommentSection from "../components/community/CommentSection";
import { getOrCreateUserPoints, awardXP } from "../components/shared/useUserPoints";
import { getDisplayName } from "../components/shared/useDisplayName";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "announcement", label: "Announcements" },
  { value: "student_projects", label: "Wins" },
  { value: "question", label: "Questions" },
];

export default function Community() {
  const [filter, setFilter] = useState("all");
  const [showComposer, setShowComposer] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const displayName = getDisplayName(user);
  const isAdmin = user?.role === "admin";

  const { data: myPoints } = useQuery({
    queryKey: ["myPointsCommunity", user?.email],
    queryFn: () => getOrCreateUserPoints(user),
    enabled: !!user?.email,
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 100),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsersForAdminCheck"],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAllUsers', {});
      return res.data?.users || [];
    },
    staleTime: 60000,
  });
  const adminEmails = new Set(allUsers.filter(u => u.role === "admin").map(u => u.email));

  const createPostMutation = useMutation({
    mutationFn: async ({ title, content, category, imageFile, postAsCoach }) => {
      let image_url = "";
      if (imageFile) {
        const result = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = result.file_url;
      }
      const authorName = postAsCoach ? "COACH" : displayName;
      const createdPost = await base44.entities.CommunityPost.create({
        title, content, category, image_url,
        author_email: user.email,
        author_name: authorName,
        author_avatar: user.avatar_url || "",
        likes: [],
        comment_count: 0,
        is_approved: isAdmin ? true : false,
        is_pinned: false,
        is_admin_post: isAdmin,
      });
      if (myPoints) {
        await awardXP(myPoints.id, myPoints, 15, { posts_created: (myPoints.posts_created || 0) + 1 });
      }
      if (isAdmin) {
        try {
          await base44.functions.invoke('notifyOnNewPost', {
            postId: createdPost.id,
            postTitle: title,
            authorEmail: user.email,
            authorName,
            isAnnouncement: true,
          });
        } catch (_) {}
      }
      return createdPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setShowComposer(false);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const likes = [...(post.likes || [])];
      const idx = likes.indexOf(user.email);
      const isNewLike = idx === -1;
      if (idx > -1) likes.splice(idx, 1);
      else likes.push(user.email);
      await base44.entities.CommunityPost.update(post.id, { likes });
      if (isNewLike && post.author_email !== user.email) {
        await base44.entities.Notification.create({
          recipient_email: post.author_email,
          type: "like",
          message: `${displayName} liked your post "${post.title}"`,
          from_name: displayName,
          post_id: post.id,
          is_read: false,
        });
      }
    },
    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["communityPosts"] });
      const previous = queryClient.getQueryData(["communityPosts"]);
      queryClient.setQueryData(["communityPosts"], (old = []) =>
        old.map((p) => {
          if (p.id !== post.id) return p;
          const likes = [...(p.likes || [])];
          const idx = likes.indexOf(user.email);
          if (idx > -1) likes.splice(idx, 1);
          else likes.push(user.email);
          return { ...p, likes };
        })
      );
      return { previous };
    },
    onError: (_err, _post, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["communityPosts"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
  });

  const pinMutation = useMutation({
    mutationFn: (post) => base44.entities.CommunityPost.update(post.id, { is_pinned: !post.is_pinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
  });

  const deletePostMutation = useMutation({
    mutationFn: async (post) => {
      await base44.entities.CommunityPost.delete(post.id);
      const comments = await base44.entities.Comment.filter({ post_id: post.id });
      await Promise.all(comments.map(c => base44.entities.Comment.delete(c.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setSelectedPost(null);
    },
  });

  const filteredPosts = posts
    .filter(p => p.is_approved !== false)
    .filter(p => filter === "all" || p.category === filter)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const pinnedPost = posts.find(p => p.is_pinned);

  const { data: liveClasses = [] } = useQuery({
    queryKey: ["upcomingLiveClasses"],
    queryFn: () => base44.entities.LiveClass.filter({ is_active: true }),
  });
  const upcomingClasses = [...liveClasses]
    .filter(c => new Date(c.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 3);

  const { data: allUserPoints = [] } = useQuery({
    queryKey: ["allUserPoints"],
    queryFn: () => base44.entities.UserPoints.list("-total_xp", 5),
  });
  const topContributors = allUserPoints.filter(p => {
    const u = allUsers.find(u => u.email === p.user_email);
    return u?.role !== "admin";
  }).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-sm text-gray-500 mt-0.5">Connect, share, and grow together</p>
        </div>
        <Button
          onClick={() => setShowComposer(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white gap-2 rounded-lg px-5"
        >
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          <CommunityFeed
            posts={filteredPosts}
            isLoading={isLoading}
            currentUser={user}
            adminEmails={adminEmails}
            myPoints={myPoints}
            onLike={(p) => likeMutation.mutate(p)}
            onPin={(p) => pinMutation.mutate(p)}
            onDelete={(p) => deletePostMutation.mutate(p)}
            onOpen={setSelectedPost}
            isAdmin={isAdmin}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 shrink-0">
          <CommunitySidebar
            pinnedPost={pinnedPost}
            upcomingClasses={upcomingClasses}
            topContributors={topContributors}
            onOpenPost={setSelectedPost}
          />
        </div>
      </div>

      {/* Post Composer Dialog */}
      <Dialog open={showComposer} onOpenChange={setShowComposer}>
        <DialogContent className="bg-white max-w-xl p-0 overflow-hidden rounded-2xl border border-gray-200">
          <PostComposer
            user={user}
            isAdmin={isAdmin}
            onSubmit={(data) => createPostMutation.mutate(data)}
            isPending={createPostMutation.isPending}
            onClose={() => setShowComposer(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Post detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="bg-white max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200">
          {selectedPost && (
            <div className="p-6 space-y-5">
              {/* Author row */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(selectedPost.author_name || selectedPost.author_email)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {adminEmails.has(selectedPost.author_email) ? "👑 " : ""}{selectedPost.author_name || selectedPost.author_email}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(selectedPost.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                    selectedPost.category === "announcement" ? "bg-red-100 text-red-700" :
                    selectedPost.category === "student_projects" ? "bg-emerald-100 text-emerald-700" :
                    selectedPost.category === "question" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {selectedPost.category?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              {selectedPost.image_url && (
                <img src={selectedPost.image_url} className="w-full rounded-xl object-cover max-h-64" />
              )}
              <h2 className="text-xl font-bold text-gray-900">{selectedPost.title}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
              <div className="border-t border-gray-100 pt-4">
                <CommentSection
                  postId={selectedPost.id}
                  user={user}
                  myPoints={myPoints}
                  isAdmin={isAdmin}
                  adminEmails={adminEmails}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}