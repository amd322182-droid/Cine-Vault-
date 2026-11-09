import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroBanner } from './components/HeroBanner.js';
import { MovieCarouselSection } from './components/MovieCarouselSection.js';
import { MovieDetailsView } from './components/MovieDetailsView.js';
import { AdvancedSearchModal } from './components/AdvancedSearchModal.js';
import { VideoPlayerModal } from './components/VideoPlayerModal.js';
import { DownloadModal } from './components/DownloadModal.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { UserAuthModal } from './components/UserAuthModal.js';
import { Footer } from './components/Footer.js';
import { AdSlot } from './components/AdSlot.js';
import { PopunderController } from './components/PopunderController.js';
import { Movie, AdConfiguration, WebsiteSettings, VideoQualityLevel } from './types/index.js';
import { Film, Filter, Sparkles } from 'lucide-react';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ads, setAds] = useState<AdConfiguration[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation & View state
  const [currentView, setCurrentView] = useState<'home' | 'movies' | 'movie-detail' | 'admin' | 'favorites'>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [previewMovie, setPreviewMovie] = useState<Movie | null>(null);
  const [downloadTarget, setDownloadTarget] = useState<{ movie: Movie; quality: VideoQualityLevel } | null>(null);

  // User session
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    favorites: string[];
    downloadHistory: any[];
  } | null>(() => {
    const saved = localStorage.getItem('cinevault_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cinevault_admin_auth') === 'true';
  });

  // Fetch initial data
  const loadData = async () => {
    try {
      const [moviesRes, adsRes, settingsRes, catRes, genRes] = await Promise.all([
        fetch('/api/movies').then((r) => r.json()),
        fetch('/api/ads').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/genres').then((r) => r.json())
      ]);

      if (moviesRes.success) setMovies(moviesRes.data);
      if (adsRes.success) setAds(adsRes.data);
      if (settingsRes.success) setSettings(settingsRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (genRes.success) setGenres(genRes.data);

      // Check initial URL for /movie/:slug or /admin
      const path = window.location.pathname;
      if (path.startsWith('/movie/')) {
        const slug = path.replace('/movie/', '').replace(/\/$/, '');
        const found = moviesRes.data.find((m: Movie) => m.slug.toLowerCase() === slug.toLowerCase());
        if (found) {
          setSelectedMovie(found);
          setCurrentView('movie-detail');
        }
      } else if (path === '/admin') {
        setCurrentView('admin');
      }
    } catch (err) {
      console.error('Error initializing platform:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to browser popstate (back/forward)
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setCurrentView('home');
        setSelectedMovie(null);
      } else if (path.startsWith('/movie/')) {
        const slug = path.replace('/movie/', '').replace(/\/$/, '');
        const found = movies.find((m) => m.slug.toLowerCase() === slug.toLowerCase());
        if (found) {
          setSelectedMovie(found);
          setCurrentView('movie-detail');
        }
      } else if (path === '/admin') {
        setCurrentView('admin');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update dynamic SEO title and URL
  useEffect(() => {
    if (currentView === 'movie-detail' && selectedMovie) {
      document.title = selectedMovie.metaTitle || `${selectedMovie.title} – Movie Information & Download | CineVault`;
      window.history.replaceState(null, '', `/movie/${selectedMovie.slug}`);
    } else if (currentView === 'admin') {
      document.title = 'Admin Management Console – CineVault';
      window.history.replaceState(null, '', '/admin');
    } else {
      document.title = 'CineVault – Professional Movie Library & Streaming Platform';
      window.history.replaceState(null, '', '/');
    }
  }, [currentView, selectedMovie]);

  // Navigate helper
  const handleNavigate = (view: string, payload?: any) => {
    if (view === 'home') {
      setCurrentView('home');
      setSelectedMovie(null);
      setSelectedCategoryFilter('All');
    } else if (view === 'movies') {
      setCurrentView('movies');
      setSelectedMovie(null);
      if (payload?.category) setSelectedCategoryFilter(payload.category);
    } else if (view === 'admin') {
      setCurrentView('admin');
    } else if (view === 'favorites') {
      setCurrentView('favorites');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Watchlist favorites toggle
  const handleToggleFavorite = async (movieId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/user/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, movieId })
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...currentUser, favorites: data.data.favorites };
        setCurrentUser(updated);
        localStorage.setItem('cinevault_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Favorite toggle error:', e);
    }
  };

  // User auth login
  const handleUserLogin = (email: string, name?: string) => {
    const userObj = {
      id: `usr_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      favorites: currentUser?.favorites || ['mv-ramayana'],
      downloadHistory: currentUser?.downloadHistory || []
    };
    setCurrentUser(userObj);
    localStorage.setItem('cinevault_user', JSON.stringify(userObj));
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cinevault_user');
  };

  // Filtered lists for each homepage section
  const latestMovies = useMemo(() => movies.filter((m) => m.category === 'Latest' || m.releaseYear >= 2025), [movies]);
  const popularMovies = useMemo(() => movies.filter((m) => m.category === 'Popular' || (m.imdbRating && m.imdbRating >= 8.0)), [movies]);
  const trendingMovies = useMemo(() => movies.filter((m) => m.category === 'Trending' || m.downloads > 10000), [movies]);
  const recentlyAdded = useMemo(() => [...movies].reverse().slice(0, 8), [movies]);
  const hollywoodMovies = useMemo(() => movies.filter((m) => m.category === 'Hollywood' || m.language === 'English'), [movies]);
  const bollywoodMovies = useMemo(() => movies.filter((m) => m.category === 'Bollywood' || m.language === 'Hindi'), [movies]);
  const southIndianMovies = useMemo(() => movies.filter((m) => m.category === 'South Indian' || m.language === 'Telugu'), [movies]);
  const animatedMovies = useMemo(() => movies.filter((m) => m.category === 'Animated' || m.genres.includes('Animation')), [movies]);
  const webSeries = useMemo(() => movies.filter((m) => m.category === 'Web Series' || m.runtime.includes('Episode')), [movies]);

  // General browse filter
  const browseFilteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (selectedCategoryFilter !== 'All' && m.category !== selectedCategoryFilter) return false;
      if (selectedGenreFilter !== 'All' && !m.genres.includes(selectedGenreFilter)) return false;
      return true;
    });
  }, [movies, selectedCategoryFilter, selectedGenreFilter]);

  // Featured hero movie (Ramayana or first movie)
  const heroMovie = movies.find((m) => m.id === 'mv-ramayana') || movies[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d13] text-slate-100 selection:bg-rose-600 selection:text-white">
      {/* Background Popunder and Social Bar script injector */}
      <PopunderController ads={ads} />

      {/* Main Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        favoritesCount={currentUser?.favorites?.length || 0}
        userEmail={currentUser?.email}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* VIEW: ADMIN PANEL */}
      {currentView === 'admin' && (
        <AdminDashboard
          onClose={() => setCurrentView('home')}
          onRefreshLibrary={loadData}
        />
      )}

      {/* VIEW: MOVIE DETAILS PAGE */}
      {currentView === 'movie-detail' && selectedMovie && (
        <main className="flex-1">
          <MovieDetailsView
            movie={selectedMovie}
            allMovies={movies}
            onBack={() => handleNavigate('home')}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            onInitiateDownload={(m, q) => setDownloadTarget({ movie: m, quality: q })}
            isFavorite={currentUser?.favorites?.includes(selectedMovie.id) || false}
            onToggleFavorite={handleToggleFavorite}
            ads={ads}
          />
        </main>
      )}

      {/* VIEW: FAVORITES / WATCHLIST */}
      {currentView === 'favorites' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                My Saved Movies & Watchlist
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Titles bookmarked for later offline viewing and downloads
              </p>
            </div>
            <button
              onClick={() => handleNavigate('home')}
              className="text-xs font-semibold text-rose-400 hover:underline"
            >
              ← Back to Catalog
            </button>
          </div>

          {currentUser?.favorites && currentUser.favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies
                .filter((m) => currentUser.favorites.includes(m.id))
                .map((m) => (
                  <div key={m.id}>
                    <MovieCarouselSection
                      title=""
                      movies={[m]}
                      onSelectMovie={handleSelectMovie}
                      onPlayPreview={(mov) => setPreviewMovie(mov)}
                      favorites={currentUser.favorites}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <Film className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Your Watchlist is Empty</p>
              <p className="text-xs text-slate-500">
                Click the bookmark button on any movie card or detail page to add it to your collection.
              </p>
              <button
                onClick={() => handleNavigate('movies', { category: 'All' })}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors"
              >
                Browse All Movies
              </button>
            </div>
          )}
        </main>
      )}

      {/* VIEW: BROWSE MOVIES (Grid with Filter pills) */}
      {currentView === 'movies' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                Explore Movie Library
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Showing {browseFilteredMovies.length} movies · 1080p, 720p & 360p Available
              </p>
            </div>

            {/* Category Filter Chips (Interactive Tabs) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategoryFilter('All')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategoryFilter === 'All'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategoryFilter === cat
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ADVERTISEMENT: Below Browse header */}
          <AdSlot placement="homepage_header" type="banner_468x60" ads={ads} />

          {/* Movies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {browseFilteredMovies.map((movie) => (
              <div key={movie.id} onClick={() => handleSelectMovie(movie)} className="cursor-pointer">
                <MovieCarouselSection
                  title=""
                  movies={[movie]}
                  onSelectMovie={handleSelectMovie}
                  onPlayPreview={(m) => setPreviewMovie(m)}
                  favorites={currentUser?.favorites || []}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </div>

          {/* ADVERTISEMENT: Bottom Browse */}
          <AdSlot placement="homepage_between_sections" type="native_banner" ads={ads} />
        </main>
      )}

      {/* VIEW: HOMEPAGE */}
      {currentView === 'home' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
          {/* 1. Cinematic Hero Featured Banner */}
          {heroMovie && (
            <HeroBanner
              movie={heroMovie}
              onSelect={handleSelectMovie}
              onPlayPreview={(m) => setPreviewMovie(m)}
              isFavorite={currentUser?.favorites?.includes(heroMovie.id) || false}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* 2. ADVERTISEMENT: Below Header */}
          <AdSlot placement="homepage_header" type="banner_468x60" ads={ads} />

          {/* 3. Latest Movies Section */}
          <MovieCarouselSection
            title="Latest Movies"
            subtitle="Brand new releases & 2025-2026 cinema additions"
            movies={latestMovies}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'Latest' })}
          />

          {/* 4. Popular Movies Section */}
          <MovieCarouselSection
            title="Popular Movies"
            subtitle="Top rated by viewers worldwide"
            movies={popularMovies}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'Popular' })}
          />

          {/* 5. ADVERTISEMENT: Between Movie Sections (Native Banner) */}
          <AdSlot placement="homepage_between_sections" type="native_banner" ads={ads} />

          {/* 6. Trending Movies Section */}
          <MovieCarouselSection
            title="Trending Movies"
            subtitle="High velocity downloads this week"
            movies={trendingMovies}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'Trending' })}
          />

          {/* 7. Recently Added Movies */}
          <MovieCarouselSection
            title="Recently Added Movies"
            subtitle="Freshly remastered digital uploads"
            movies={recentlyAdded}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* 8. Hollywood Movies */}
          <MovieCarouselSection
            title="Hollywood Movies"
            subtitle="English language international blockbusters & noir classics"
            movies={hollywoodMovies}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'Hollywood' })}
          />

          {/* 9. ADVERTISEMENT: Middle Section (300x250 Banner) */}
          <AdSlot placement="details_below_info" type="banner_300x250" ads={ads} />

          {/* 10. Bollywood Movies */}
          <MovieCarouselSection
            title="Bollywood Movies"
            subtitle="Grand Hindi mythological epics, romance & action"
            movies={bollywoodMovies}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'Bollywood' })}
          />

          {/* 11. South Indian Movies */}
          <MovieCarouselSection
            title="South Indian Movies"
            subtitle="High octane Telugu, Tamil, and Malayalam cinema"
            movies={southIndianMovies}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'South Indian' })}
          />

          {/* 12. Animated Movies */}
          <MovieCarouselSection
            title="Animated Movies"
            subtitle="Creative Commons and restored animated masterpieces"
            movies={animatedMovies}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'Animated' })}
          />

          {/* 13. Web Series */}
          <MovieCarouselSection
            title="Web Series"
            subtitle="Full season episodic series with high quality audio packs"
            movies={webSeries}
            onSelectMovie={handleSelectMovie}
            onPlayPreview={(m) => setPreviewMovie(m)}
            favorites={currentUser?.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onViewAll={() => handleNavigate('movies', { category: 'Web Series' })}
          />

          {/* 14. Genre Filter Categories Bar */}
          <section className="p-6 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Browse by Cinema Genres
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setSelectedGenreFilter(g);
                    setCurrentView('movies');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* Global Modals */}
      {/* 1. Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        movies={movies}
        onSelectMovie={handleSelectMovie}
        onPlayPreview={(m) => setPreviewMovie(m)}
        favorites={currentUser?.favorites || []}
        onToggleFavorite={handleToggleFavorite}
        categories={categories}
        genres={genres}
      />

      {/* 2. Video Player Preview Trailer Modal */}
      <VideoPlayerModal
        isOpen={!!previewMovie}
        movie={previewMovie}
        onClose={() => setPreviewMovie(null)}
      />

      {/* 3. Download Confirmation Modal */}
      <DownloadModal
        isOpen={!!downloadTarget}
        movie={downloadTarget?.movie || null}
        selectedQuality={downloadTarget?.quality || '720p'}
        onClose={() => setDownloadTarget(null)}
        ads={ads}
        userEmail={currentUser?.email}
        onDownloadCompleted={() => loadData()}
      />

      {/* 4. User Auth / Profile Modal */}
      <UserAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleUserLogin}
        onLogout={handleUserLogout}
        allMovies={movies}
        onSelectMovie={handleSelectMovie}
      />

      {/* Footer with legal policies and copyright removal notice */}
      <Footer
        onNavigateCategory={(cat) => handleNavigate('movies', { category: cat })}
        ads={ads}
      />
    </div>
  );
}
