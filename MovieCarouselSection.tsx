import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types/index.js';
import { MovieCard } from './MovieCard.js';

interface MovieCarouselSectionProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayPreview: (movie: Movie) => void;
  favorites: string[];
  onToggleFavorite: (movieId: string) => void;
  onViewAll?: () => void;
}

export const MovieCarouselSection: React.FC<MovieCarouselSectionProps> = ({
  title,
  subtitle,
  movies,
  onSelectMovie,
  onPlayPreview,
  favorites,
  onToggleFavorite,
  onViewAll
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -400 : 400;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="relative my-8 sm:my-10">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-['Outfit']">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors mr-2 whitespace-nowrap"
            >
              See All ({movies.length}) →
            </button>
          )}

          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Grid */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-[170px] sm:w-[200px] md:w-[220px] flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MovieCard
              movie={movie}
              onSelect={onSelectMovie}
              onPlayPreview={onPlayPreview}
              isFavorite={favorites.includes(movie.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
