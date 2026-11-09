import React from 'react';
import { Play, Download, Star, Bookmark, Info } from 'lucide-react';
import { Movie } from '../types/index.js';

interface HeroBannerProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlayPreview: (movie: Movie) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (movieId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onSelect,
  onPlayPreview,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <div className="relative w-full min-h-[460px] md:min-h-[540px] flex items-end overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl bg-slate-950">
      {/* Background Hero Image */}
      <img
        src={movie.backdropUrl || movie.posterUrl || '/src/assets/images/hero_cinematic_epic_1794202756913.jpg'}
        alt={movie.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 transform scale-100 hover:scale-102 transition-transform duration-700"
      />

      {/* Cinematic Scrim Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13] via-[#0b0d13]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d13] via-[#0b0d13]/80 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl p-6 md:p-10 lg:p-12 space-y-4">
        {/* Category & Status Kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-rose-400">
          <span>Featured Blockbuster</span>
          <span aria-hidden="true">·</span>
          <span>{movie.category}</span>
          <span aria-hidden="true">·</span>
          <span>{movie.language}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight text-balance">
          {movie.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 flex-wrap">
          {movie.imdbRating && (
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {movie.imdbRating.toFixed(1)} IMDb
            </span>
          )}
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{movie.releaseYear}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{movie.runtime}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-200">{movie.genres.join(', ')}</span>
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-slate-300/95 max-w-2xl line-clamp-3 leading-relaxed">
          {movie.description}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onPlayPreview(movie)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-sm shadow-xl shadow-white/10 hover:scale-102 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Watch Preview</span>
          </button>

          <button
            onClick={() => onSelect(movie)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 hover:scale-102 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Movie</span>
          </button>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(movie.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-md text-sm font-semibold transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-black/40 border-slate-700 text-slate-300 hover:text-white hover:bg-black/60'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Watchlist'}</span>
            </button>
          )}

          <button
            onClick={() => onSelect(movie)}
            className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="View Full Cast & Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
