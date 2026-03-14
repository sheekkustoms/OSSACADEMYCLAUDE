import React, { useRef, useState } from "react";
import { Play, Pause, Maximize } from "lucide-react";

export default function ReplayPlayer({ player, title }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const goFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  // iframe-based (Vimeo / Drive) — no downloads, no URL exposure, no new tab
  if (player.type === "iframe") {
    return (
      <div
        ref={containerRef}
        className="aspect-video relative bg-black group"
        onContextMenu={e => e.preventDefault()}
      >
        <iframe
          src={player.url}
          className="w-full h-full"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          title={title}
          referrerPolicy="no-referrer"
          style={{ pointerEvents: "auto" }}
        />
        {/* Fullscreen button overlay */}
        <button
          onClick={goFullscreen}
          className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Native video — custom play/pause + fullscreen
  return (
    <div ref={containerRef} className="aspect-video relative bg-black group cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        className="w-full h-full"
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={e => e.preventDefault()}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      >
        <source src={player.url} />
      </video>

      {/* Play/Pause overlay */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
        <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
          {playing
            ? <Pause className="w-8 h-8 text-white fill-white" />
            : <Play className="w-8 h-8 text-white fill-white" />
          }
        </div>
      </div>

      {/* Bottom controls bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={togglePlay}
          className="text-white hover:text-[#D4AF37] transition-colors"
        >
          {playing
            ? <Pause className="w-5 h-5 fill-current" />
            : <Play className="w-5 h-5 fill-current" />
          }
        </button>
        <button
          onClick={goFullscreen}
          className="text-white hover:text-[#D4AF37] transition-colors"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}