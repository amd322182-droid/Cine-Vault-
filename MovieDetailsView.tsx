import React, { useState } from 'react';
import {
  Star,
  Download,
  Play,
  ArrowLeft,
  Bookmark,
  Share2,
  Calendar,
  Clock,
  Globe,
  Film,
  Users,
  Check
} from 'lucide-react';
import { Movie, VideoQualityLevel, AdConfiguration } from '../types/index.js';
import { AdSlot } from './AdSlot.js';
import { MovieCard } from './MovieCard.js';

interface MovieDetailsViewProps {
  movie: Movie;
  allMovies: Movie[];
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayPreview: (movie: Movie) => void;
  onInitiateDownload: (movie: Movie, quality: VideoQualityLevel) => void;
  isFavorite: boolean;
  onToggleFavorite: (movieId: string) => void;
  ads: AdConfiguration[];
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({
  movie,
  allMovies,
  onBack,
  onSelectMovie,
  onPlayPreview,
  onInitiateDownload,
  isFavorite,
  onToggleFavorite,
  ads
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Related movies in same category or genre
  const relatedMovies = allMovies
    .filter((m) => m.id !== movie.id && (m.category === movie.category || m.genres.some((g) => movie.genres.includes(g))))
    .slice(0, 6);

  const recommendedMovies = allMovies
    .filter((m) => m.id !== movie.id && !relatedMovies.some((r) => r.id === m.id))
    .slice(0, 5);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation & Back */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="hover:text-slate-300 cursor-pointer" onClick={onBack}>Home</span>
          <span>/</span>
          <span className="hover:text-slate-300 cursor-pointer">{movie.category}</span>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-[200px]">{movie.title}</span>
        </div>
      </nav>

      {/* Main Hero Movie Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-[#0d111b] shadow-2xl">
        {/* Backdrop Banner */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src={movie.backdropUrl || movie.posterUrl || '/src/assets/images/hero_cinematic_epic_1794202756913.jpg'}
            alt={`${movie.title} Backdrop`}
            className="w-full h-full object-cover filter brightness-75 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d111b] via-[#0d111b]/60 to-transparent" />
        </div>

        {/* Content Container Split */}
        <div className="relative px-6 pb-8 pt-0 -mt-24 sm:-mt-32 md:-mt-40 flex flex-col md:flex-row gap-8 items-start">
          {/* Left: Large Movie Poster */}
          <div className="w-48 sm:w-56 md:w-64 shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-900 group">
              <img
                src={movie.posterUrl || '/src/assets/images/poster_vintage_detective_1794202758894.jpg'}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onPlayPreview(movie)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </button>
            </div>

            {/* Poster Under-buttons */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(movie.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
                <span>{isFavorite ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right: Detailed Metadata & Synopsis */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
                <span>{movie.category}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.language}</span>
                <span aria-hidden="true">·</span>
                <span>Authorized Media</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-['Outfit']">
                {movie.title}
              </h1>

              {movie.altTitle && (
                <p className="text-sm text-slate-400 italic mt-0.5">{movie.altTitle}</p>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 flex-wrap">
              {movie.imdbRating && (
                <span className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {movie.imdbRating.toFixed(1)} / 10 IMDb
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-4 h-4" /> {movie.releaseYear}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-4 h-4" /> {movie.runtime}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Globe className="w-4 h-4" /> {movie.language}
              </span>
            </div>

            {/* Genres */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Genres:</span>
              <span>{movie.genres.join(' · ')}</span>
            </div>

            {/* Story Description */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
                Storyline & Overview
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </div>

            {/* Crew Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Director</span>
                <span className="text-slate-200 font-medium text-sm flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-400" /> {movie.director}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Starring Cast</span>
                <span className="text-slate-200 font-medium text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> {movie.cast.join(', ')}
                </span>
              </div>
            </div>

            {/* Searchable Keywords */}
            {movie.keywords && movie.keywords.length > 0 && (
              <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-slate-400">
                <span className="font-semibold text-slate-500">Keywords:</span>
                {movie.keywords.map((kw, idx) => (
                  <span key={idx} className="text-slate-400">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADVERTISEMENT: Below movie information */}
      <AdSlot placement="details_below_info" type="banner_300x250" ads={ads} />

      {/* DOWNLOAD SECTION (3 Dedicated Professional Buttons) */}
      <section className="bg-gradient-to-b from-[#121828] to-[#0e1320] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Download className="w-6 h-6 text-rose-500" />
              Download Full Movie Options
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your preferred video resolution. High-speed direct downloads with zero fake timers or popups.
            </p>
          </div>

          <button
            onClick={() => onPlayPreview(movie)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play Trailer</span>
          </button>
        </div>

        {/* 3 Quality Download Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 360p */}
          {movie.qualities.find((q) => q.quality === '360p' && q.isAvailable) ? (
            <div className="p-4 rounded-xl bg-[#0b0e17] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Standard Definition</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                    360p SD
                  </span>
                </div>
                <div className="text-lg font-bold text-white">
                  360p Download — {movie.qualities.find((q) => q.quality === '360p')?.fileSizeDisplay || '250 MB'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Ideal for mobile data saving and low bandwidth connections.
                </p>
              </div>

              <button
                onClick={() => onInitiateDownload(movie, '360p')}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download 360p</span>
              </button>
            </div>
          ) : null}

          {/* 720p */}
          {movie.qualities.find((q) => q.quality === '720p' && q.isAvailable) ? (
            <div className="p-4 rounded-xl bg-[#0b0e17] border border-blue-900/40 hover:border-blue-700 transition-all flex flex-col justify-between gap-4 relative overflow-hidden">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">High Definition</span>
                  <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                    720p HD
                  </span>
                </div>
                <div className="text-lg font-bold text-white">
                  720p Download — {movie.qualities.find((q) => q.quality === '720p')?.fileSizeDisplay || '850 MB'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Crisp resolution for tablets, laptops, and mobile screens.
                </p>
              </div>

              <button
                onClick={() => onInitiateDownload(movie, '720p')}
                className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download 720p</span>
              </button>
            </div>
          ) : null}

          {/* 1080p */}
          {movie.qualities.find((q) => q.quality === '1080p' && q.isAvailable) ? (
            <div className="p-4 rounded-xl bg-[#0b0e17] border border-rose-900/50 hover:border-rose-600 transition-all flex flex-col justify-between gap-4 relative overflow-hidden">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400">Full HD Master</span>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold shadow-sm">
                    1080p FHD
                  </span>
                </div>
                <div className="text-lg font-bold text-white">
                  1080p Download — {movie.qualities.find((q) => q.quality === '1080p')?.fileSizeDisplay || '1.8 GB'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Uncompressed audio, crisp cinematic details for large TVs and desktops.
                </p>
              </div>

              <button
                onClick={() => onInitiateDownload(movie, '1080p')}
                className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download 1080p</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* ADVERTISEMENT: Near download options */}
        <div className="pt-4 border-t border-slate-800/80">
          <AdSlot placement="details_near_downloads" type="native_banner" ads={ads} />
        </div>
      </section>

      {/* RELATED MOVIES */}
      {relatedMovies.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-['Outfit']">Related Movies in {movie.category}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedMovies.map((rel) => (
              <MovieCard
                key={rel.id}
                movie={rel}
                onSelect={onSelectMovie}
                onPlayPreview={onPlayPreview}
                isFavorite={false}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* ADVERTISEMENT: Between related movies */}
      <AdSlot placement="homepage_between_sections" type="banner_468x60" ads={ads} />

      {/* RECOMMENDED FOR YOU */}
      {recommendedMovies.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-['Outfit']">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendedMovies.map((rec) => (
              <MovieCard
                key={rec.id}
                movie={rec}
                onSelect={onSelectMovie}
                onPlayPreview={onPlayPreview}
                isFavorite={false}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
