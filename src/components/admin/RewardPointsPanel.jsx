import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trophy, Search, X, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function RewardPointsPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [xpAmount, setXpAmount] = useState(50);
  const [customMessage, setCustomMessage] = useState("🏆 Congratulations! You've been rewarded points for completing your project!");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: allUserPoints = [] } = useQuery({
    queryKey: ["adminAllUserPoints"],
    queryFn: () => base44.entities.UserPoints.list("-last_activity_date", 200),
  });

  const nonAdminUsers = allUsers.filter(u => u.role !== "admin");

  const filtered = nonAdminUsers.filter(u => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.full_name || "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.display_name || "").toLowerCase().includes(q)
    );
  });

  const toggle = (u) => {
    setSelectedUsers(prev =>
      prev.find(s => s.id === u.id) ? prev.filter(s => s.id !== u.id) : [...prev, u]
    );
  };

  const handleReward = async () => {
    if (!selectedUsers.length || !xpAmount) return;
    setSending(true);

    const names = selectedUsers.map(u => u.display_name || u.full_name || u.email.split("@")[0]).join(", ");

    try {
      // 1. Add XP to each selected user & send notification
      await Promise.all(selectedUsers.map(async (u) => {
        const pointsRecord = allUserPoints.find(p => p.user_email === u.email);
        if (pointsRecord) {
          await base44.entities.UserPoints.update(pointsRecord.id, {
            total_xp: (pointsRecord.total_xp || 0) + xpAmount,
          });
        } else {
          await base44.entities.UserPoints.create({
            user_email: u.email,
            user_name: u.display_name || u.full_name || u.email,
            total_xp: xpAmount,
          });
        }

        // Send personal notification
        await base44.entities.Notification.create({
          recipient_email: u.email,
          type: "badge",
          message: `🏆 You earned ${xpAmount} XP! ${customMessage}`,
          from_name: "COACH",
          is_read: false,
        });
      }));

      // 2. Create a public community post celebrating the winners
      const postContent = `🎉 Shoutout to our amazing students who completed their projects and earned points!\n\n🏆 ${names}\n\nEach of you has been awarded ${xpAmount} XP. Keep up the incredible work! We are so proud of you! 🧵✨`;

      await base44.entities.CommunityPost.create({
        title: "🏆 Project Completion Awards!",
        content: postContent,
        author_email: user.email,
        author_name: "COACH",
        author_avatar: user.avatar_url || "",
        category: "announcement",
        is_pinned: false,
        is_approved: true,
        is_admin_post: true,
        likes: [],
        comment_count: 0,
      });

      queryClient.invalidateQueries({ queryKey: ["adminAllUserPoints"] });
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      queryClient.invalidateQueries({ queryKey: ["adminPosts"] });

      toast.success(`Rewarded ${selectedUsers.length} student(s) and posted to community!`);
      setSelectedUsers([]);
      setSearch("");
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    }

    setSending(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 text-amber-600 font-semibold">
        <Trophy className="w-5 h-5" /> Reward Students for Project Completion
      </div>
      <p className="text-sm text-gray-500">
        Pick students from the list, set XP amount, and hit Send — they'll each get a personal notification and a public community post will celebrate their achievement!
      </p>

      {/* Selected chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map(u => (
            <Badge key={u.id} className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1 pr-1">
              {u.display_name || u.full_name || u.email.split("@")[0]}
              <button onClick={() => toggle(u)} className="ml-1 hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search & member list */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 border-gray-200"
          />
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No members found</p>
          )}
          {filtered.map(u => {
            const selected = !!selectedUsers.find(s => s.id === u.id);
            const pts = allUserPoints.find(p => p.user_email === u.email);
            return (
              <button
                key={u.id}
                onClick={() => toggle(u)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selected ? "bg-amber-50" : "bg-white hover:bg-gray-50"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${selected ? "bg-amber-500" : "bg-gradient-to-br from-pink-400 to-violet-500"}`}>
                  {selected ? <CheckCircle className="w-4 h-4" /> : (u.full_name || u.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.display_name || u.full_name || u.email}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{pts?.total_xp || 0} XP</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* XP & message */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">XP to Award:</label>
          <Input
            type="number"
            min={1}
            value={xpAmount}
            onChange={e => setXpAmount(parseInt(e.target.value) || 0)}
            className="w-28 border-gray-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Personal Notification Message:</label>
          <Textarea
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            className="border-gray-200 min-h-[80px] text-sm"
          />
        </div>
      </div>

      {/* Send button */}
      <Button
        onClick={handleReward}
        disabled={!selectedUsers.length || !xpAmount || sending}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-11"
      >
        {sending ? (
          "Sending rewards..."
        ) : done ? (
          <><CheckCircle className="w-4 h-4 mr-2" /> Rewards Sent!</>
        ) : (
          <><Send className="w-4 h-4 mr-2" /> Reward {selectedUsers.length || 0} Student{selectedUsers.length !== 1 ? "s" : ""}</>
        )}
      </Button>
    </div>
  );
}