import React from "react";
import { Users } from "lucide-react";
import CommunityPostCard from "./CommunityPostCard";

export default function CommunityFeed({ posts, isLoading, currentUser, adminEmails, myPoints, onLike, onPin, onDelete, onOpen, isAdmin }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-200" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
        <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No posts yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to post in this category!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, i) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          adminEmails={adminEmails}
          myPoints={myPoints}
          onLike={onLike}
          onPin={onPin}
          onDelete={onDelete}
          onOpen={onOpen}
          isAdmin={isAdmin}
          index={i}
        />
      ))}
    </div>
  );
}