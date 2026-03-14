import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X, Paperclip } from "lucide-react";
import { getDisplayName } from "../shared/useDisplayName";

const POST_TYPES = [
  { value: "discussion", label: "💬 Discussion" },
  { value: "announcement", label: "📢 Announcement" },
  { value: "student_projects", label: "🏆 Win / Project" },
  { value: "question", label: "❓ Question" },
  { value: "resource", label: "📚 Resource" },
  { value: "ask_the_coach", label: "🎽 Ask the Coach" },
];

export default function PostComposer({ user, isAdmin, onSubmit, isPending, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("discussion");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [postAsCoach, setPostAsCoach] = useState(false);
  const displayName = getDisplayName(user);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, content, category, imageFile, postAsCoach });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(displayName)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{postAsCoach ? "COACH" : displayName}</p>
            <p className="text-xs text-gray-400">Posting to Community</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        {/* Post type */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="border-gray-200 h-9 text-sm bg-gray-50 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POST_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border-gray-200 font-semibold text-gray-900 text-base h-11"
        />

        <Textarea
          placeholder="What's on your mind? Share with the community..."
          value={content}
          onChange={e => setContent(e.target.value)}
          className="border-gray-200 min-h-[120px] resize-none text-gray-700 text-sm"
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={imagePreview} className="w-full max-h-48 object-cover" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Attachment row */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-800 px-3 py-2 rounded-lg border border-dashed border-gray-200 hover:border-gray-400 transition-colors">
            <ImagePlus className="w-4 h-4" /> Photo
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        </div>

        {/* Admin: post as coach toggle */}
        {isAdmin && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <button
              onClick={() => setPostAsCoach(v => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${postAsCoach ? "bg-amber-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${postAsCoach ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className="text-xs font-medium text-amber-800">Post as 👑 COACH</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} className="border-gray-200">Cancel</Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || isPending}
          className="bg-gray-900 hover:bg-gray-800 text-white px-6"
        >
          {isPending ? "Posting..." : "Post to Community"}
        </Button>
      </div>
    </div>
  );
}