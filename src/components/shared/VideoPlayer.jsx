import React from "react";
import { Play } from "lucide-react";

function getVideoEmbed(url) {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`, allowExtra: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" };

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`, allowExtra: "autoplay; fullscreen; picture-in-picture" };

  // Google Drive — handle all share/open/uc formats with public viewing
  // Use /preview endpoint with proper params to prevent access prompts
  const gdriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    const fileId = gdriveMatch[1];
    // Use embedded preview with usp=sharing to bypass access request
    return { type: "gdrive", src: `https://drive.google.com/file/d/${fileId}/preview?usp=sharing`, fileId };
  }

  // Direct video file
  return { type: "video", src: url };
}

export default function VideoPlayer({ url, lessonId, enrollmentRequired }) {
  const embed = getVideoEmbed(url);

  if (!url || (!embed && enrollmentRequired)) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
        <Play className="w-16 h-16 mb-2 opacity-30" />
        <p className="text-sm">{enrollmentRequired ? "Enroll to start watching" : "Select a lesson to start"}</p>
      </div>
    );
  }

  if (!embed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
        <Play className="w-16 h-16 mb-2 opacity-30" />
        <p className="text-sm">Select a lesson to start</p>
      </div>
    );
  }

  if (embed.type === "gdrive") {
    return (
      <div className="relative w-full h-full" onContextMenu={(e) => e.preventDefault()}>
        <iframe
          key={lessonId}
          className="w-full h-full"
          src={embed.src}
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
        {/* Block the entire Google Drive top bar */}
        <div
          className="absolute top-0 left-0 right-0 bg-gray-900"
          style={{ height: "52px", zIndex: 10, pointerEvents: "all", cursor: "default" }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] font-extrabold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent px-3 leading-[52px] inline-block">
            Oh Sew Sheek
          </span>
        </div>
        {/* Block the pop-out arrow that appears top-right inside the video */}
        <div
          className="absolute top-0 right-0 bg-black"
          style={{ width: "80px", height: "80px", zIndex: 20, pointerEvents: "all", cursor: "default" }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  if (embed.type === "iframe") {
    return (
      <iframe
        key={lessonId}
        className="w-full h-full"
        src={embed.src}
        allow={embed.allowExtra || "fullscreen"}
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <video
      key={lessonId}
      controls
      autoPlay
      className="w-full h-full object-contain"
      src={embed.src}
    />
  );
}