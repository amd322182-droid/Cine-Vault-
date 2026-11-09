import React from 'react';
import { Film, Search, Bookmark, Shield, User, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  favoritesCount: number;
  userEmail?: string;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
  favoritesCount,
  userEmail,
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0d13]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (single clean element) */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit']">
            Cine<span className="text-rose-500">Vault</span>
          </span>
        </button>

        {/* Zone 2: 4-5 Clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'home' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('movies', { category: 'All' })}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'movies' ? 'text-rose-400 font-semibold' : ''
            }`}
          >
            Browse Movies
          </button>
          <button
            onClick={() => onNavigate('movies', { category: 'Trending' })}
            className="whitespace-nowrap transition-colors hover:text-white"
          >
            Trending
          </button>
          <button
            onClick={() => onNavigate('movies', { category: 'Web Series' })}
            className="whitespace-nowrap transition-colors hover:text-white"
          >
            Web Series
          </button>
          <button
            onClick={() => onNavigate('movies', { category: 'South Indian' })}
            className="whitespace-nowrap transition-colors hover:text-white"
          >
            South Cinema
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Quick Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-all shadow-sm"
            title="Search Movies by Title, Cast, Genre, Director..."
          >
            <Search className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Search movies...</span>
            <kbd className="hidden lg:inline text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
          </button>

          {/* Watchlist / Favorites */}
          <button
            onClick={() => onNavigate('favorites')}
            className="relative p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="My Saved Movies"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Admin Panel Access */}
          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              currentView === 'admin' || isAdminLoggedIn
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Administrator Management Console"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* User Account Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{userEmail ? userEmail.split('@')[0] : 'Sign In'}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0d1017] px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-rose-400"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('movies', { category: 'All' });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-rose-400"
          >
            All Movies
          </button>
          <button
            onClick={() => {
              onNavigate('movies', { category: 'Bollywood' });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-rose-400"
          >
            Bollywood Movies
          </button>
          <button
            onClick={() => {
              onNavigate('movies', { category: 'Hollywood' });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-rose-400"
          >
            Hollywood Cinema
          </button>
          <button
            onClick={() => {
              onNavigate('movies', { category: 'South Indian' });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-rose-400"
          >
            South Indian Movies
          </button>
          <button
            onClick={() => {
              onNavigate('movies', { category: 'Animated' });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-rose-400"
          >
            Animated Movies
          </button>
          <button
            onClick={() => {
              onNavigate('movies', { category: 'Web Series' });
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-rose-400"
          >
            Web Series
          </button>
        </div>
      )}
    </header>
  );
};
