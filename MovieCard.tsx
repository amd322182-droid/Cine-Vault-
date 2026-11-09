import React from 'react';
import { Star, Download, Play, Bookmark } from 'lucide-react';
import { Movie } from '../types/index.js';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlayPreview?: (movie: Movie) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (movieId: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onPlayPreview,
  isFavorite,
  onToggleFavorite
}) => {
  // Available qualities list
  const availableQualities = movie.qualities
    .filter((q) => q.isAvailable)
    .map((q) => q.quality);

  return (
    <div className="group relative flex flex-col bg-[#111624] border border-slate-800/90 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-rose-950/20 transition-all duration-300">
      {/* Poster Image Container */}
      <div
        onClick={() => onSelect(movie)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900 cursor-pointer"
      >
        <img
          src={movie.posterUrl || '/src/assets/images/poster_vintage_detective_1794202758894.jpg'}
          alt={`${movie.title} Movie Poster`}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/poster_vintage_detective_1794202758894.jpg';
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13] via-[#0b0d13]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges: Rating & Quality */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {movie.imdbRating ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-500/30">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {movie.imdbRating.toFixed(1)}
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            {availableQualities.includes('1080p') ? (
              <span className="px-1.5 py-0.5 rounded bg-rose-600/90 text-white text-[10px] font-bold tracking-wider">
                1080p
              </span>
            ) : availableQualities.includes('720p') ? (
              <span className="px-1.5 py-0.5 rounded bg-blue-600/90 text-white text-[10px] font-bold tracking-wider">
                720p
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-slate-700/90 text-slate-200 text-[10px] font-bold tracking-wider">
                360p
              </span>
            )}
          </div>
        </div>

        {/* Favorite button toggle */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(movie.id);
            }}
            className={`absolute top-2.5 right-14 p-1.5 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
            }`}
            title={isFavorite ? 'Remove from Saved' : 'Save to Watchlist'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-slate-950' : ''}`} />
          </button>
        )}

        {/* Center Hover Play Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPlayPreview) onPlayPreview(movie);
              else onSelect(movie);
            }}
            className="w-12 h-12 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/50 hover:scale-110 transition-transform"
            title="Watch Preview Trailer"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>

        {/* Bottom Bar: Qualities and Runtime */}
        <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{movie.runtime || '120 min'}</span>
          <span className="text-slate-300 font-medium">{movie.language}</span>
        </div>
      </div>

      {/* Movie Details Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3
            onClick={() => onSelect(movie)}
            className="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-rose-400 transition-colors cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h3>

          {/* Unboxed Metadata with separators (§1.A Zero-Pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 flex-wrap">
            <span>{movie.releaseYear}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{movie.genres.slice(0, 2).join(', ')}</span>
          </div>
        </div>

        {/* Actions Button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-rose-400 font-semibold">{movie.downloads?.toLocaleString() || 0}</span>
            <span>downloads</span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(movie)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-medium transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
