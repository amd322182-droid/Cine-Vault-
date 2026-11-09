import React, { useRef } from 'react';
import { X, Play, Pause, Volume2, Maximize, Film } from 'lucide-react';
import { Movie } from '../types/index.js';

interface VideoPlayerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);

  if (!isOpen || !movie) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#090c14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f1422] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">{movie.title}</h3>
              <p className="text-[11px] text-slate-400">
                Official Cinematic Preview Trailer · {movie.releaseYear} · {movie.language}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video bg-black flex items-center justify-center group">
          <video
            ref={videoRef}
            src={movie.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            autoPlay
            controls
            playsInline
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#0d101a] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Streamed via verified public domain & authorized media cluster</span>
          <span className="text-slate-300 font-semibold">{movie.runtime}</span>
        </div>
      </div>
    </div>
  );
};
