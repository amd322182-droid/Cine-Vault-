import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Movie, VideoQualityLevel } from '../types/index.js';
import { MovieCard } from './MovieCard.js';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayPreview: (movie: Movie) => void;
  favorites: string[];
  onToggleFavorite: (movieId: string) => void;
  initialQuery?: string;
  categories: string[];
  genres: string[];
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  movies,
  onSelectMovie,
  onPlayPreview,
  favorites,
  onToggleFavorite,
  initialQuery = '',
  categories,
  genres
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedQuality, setSelectedQuality] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Extract unique languages and years from all movies
  const languages = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      if (m.language) set.add(m.language);
    });
    return Array.from(set);
  }, [movies]);

  const years = useMemo(() => {
    const set = new Set<number>();
    movies.forEach((m) => {
      if (m.releaseYear) set.add(m.releaseYear);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [movies]);

  // Quick Autocomplete Suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches: string[] = [];
    for (const m of movies) {
      if (m.title.toLowerCase().includes(q) && !matches.includes(m.title)) {
        matches.push(m.title);
      }
      if (m.director.toLowerCase().includes(q) && !matches.includes(m.director)) {
        matches.push(m.director);
      }
      for (const actor of m.cast) {
        if (actor.toLowerCase().includes(q) && !matches.includes(actor)) {
          matches.push(actor);
        }
      }
      for (const keyword of m.keywords) {
        if (keyword.toLowerCase().includes(q) && !matches.includes(keyword)) {
          matches.push(keyword);
        }
      }
      if (matches.length >= 6) break;
    }
    return matches;
  }, [searchQuery, movies]);

  // Comprehensive Filter Logic
  const filteredMovies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return movies.filter((movie) => {
      // 1. Text Search across Title, Alt Title, Keywords, Director, Cast, Genres
      if (q) {
        const titleMatch = movie.title.toLowerCase().includes(q);
        const altMatch = movie.altTitle?.toLowerCase().includes(q);
        const directorMatch = movie.director.toLowerCase().includes(q);
        const castMatch = movie.cast.some((c) => c.toLowerCase().includes(q));
        const keywordMatch = movie.keywords.some((k) => k.toLowerCase().includes(q));
        const genreMatch = movie.genres.some((g) => g.toLowerCase().includes(q));
        const categoryMatch = movie.category.toLowerCase().includes(q);
        const yearMatch = movie.releaseYear.toString().includes(q);

        if (!(titleMatch || altMatch || directorMatch || castMatch || keywordMatch || genreMatch || categoryMatch || yearMatch)) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'All' && movie.category !== selectedCategory) {
        return false;
      }

      // 3. Genre
      if (selectedGenre !== 'All' && !movie.genres.includes(selectedGenre)) {
        return false;
      }

      // 4. Quality
      if (selectedQuality !== 'All') {
        const hasQuality = movie.qualities.some(
          (item) => item.quality === selectedQuality && item.isAvailable
        );
        if (!hasQuality) return false;
      }

      // 5. Language
      if (selectedLanguage !== 'All' && movie.language !== selectedLanguage) {
        return false;
      }

      // 6. Year
      if (selectedYear !== 'All' && movie.releaseYear !== Number(selectedYear)) {
        return false;
      }

      return true;
    });
  }, [
    movies,
    searchQuery,
    selectedCategory,
    selectedGenre,
    selectedQuality,
    selectedLanguage,
    selectedYear
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedGenre('All');
    setSelectedQuality('All');
    setSelectedLanguage('All');
    setSelectedYear('All');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div className="max-w-6xl w-full mx-auto bg-[#0d111b] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header & Search Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-[#0f1422]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                Advanced Movie Search & Library
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by movie title, actor, director, genre, or keyword (e.g. Ramayana, Ryan Gosling, Noir)..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestion Chips */}
          {suggestions.length > 0 && (
            <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 text-xs text-slate-300">
              <span className="text-slate-500 shrink-0">Suggestions:</span>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(item)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 shrink-0 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Filter Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="All">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Video Quality */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Video Quality
              </label>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="All">All Qualities</option>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="360p">360p Standard</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="All">All Languages</option>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Release Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="All">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400">
              Found <span className="text-white font-bold">{filteredMovies.length}</span> matching titles
            </span>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Filter className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-base font-semibold text-slate-300">No movies match your criteria</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, checking for spelling errors, or searching by actor, director, or broader keywords.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={(m) => {
                    onSelectMovie(m);
                    onClose();
                  }}
                  onPlayPreview={(m) => {
                    onPlayPreview(m);
                    onClose();
                  }}
                  isFavorite={favorites.includes(movie.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
