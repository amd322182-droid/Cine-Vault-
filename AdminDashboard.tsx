import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Upload,
  Film,
  Megaphone,
  HardDrive,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Users,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Movie, MovieQuality, AdConfiguration, WebsiteSettings, AdminStats, VideoQualityLevel } from '../types/index.js';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshLibrary: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onRefreshLibrary }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cinevault_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('admin@cinevault.org');
  const [adminPassword, setAdminPassword] = useState('admin12345');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'movies' | 'ads' | 'storage' | 'settings'>('overview');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ads, setAds] = useState<AdConfiguration[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Movie Upload / Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    altTitle: '',
    slug: '',
    releaseYear: new Date().getFullYear(),
    language: 'English',
    genres: ['Action', 'Sci-Fi'],
    description: '',
    director: '',
    cast: '',
    imdbRating: 8.0,
    runtime: '120 min',
    keywords: '',
    metaTitle: '',
    metaDescription: '',
    category: 'Latest' as any,
    posterUrl: '',
    backdropUrl: '',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    status: 'published' as 'published' | 'draft' | 'unpublished',
    qualities: [
      {
        id: 'q-360',
        quality: '360p' as VideoQualityLevel,
        fileName: 'movie_360p.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 262144000,
        fileSizeDisplay: '250 MB',
        downloadUrl: '',
        isAvailable: true
      },
      {
        id: 'q-720',
        quality: '720p' as VideoQualityLevel,
        fileName: 'movie_720p.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 891289600,
        fileSizeDisplay: '850 MB',
        downloadUrl: '',
        isAvailable: true
      },
      {
        id: 'q-1080',
        quality: '1080p' as VideoQualityLevel,
        fileName: 'movie_1080p.mkv',
        fileFormat: 'MKV',
        fileSizeBytes: 1932735283,
        fileSizeDisplay: '1.8 GB',
        downloadUrl: '',
        isAvailable: true
      }
    ]
  });

  // Upload Progress trackers
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, moviesRes, adsRes, settingsRes, catsRes, genresRes] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/movies?status=all').then((r) => r.json()),
        fetch('/api/ads').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/genres').then((r) => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (moviesRes.success) setMovies(moviesRes.data);
      if (adsRes.success) setAds(adsRes.data);
      if (settingsRes.success) setSettings(settingsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      if (genresRes.success) setGenres(genresRes.data);
    } catch (e) {
      console.error('Failed loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('cinevault_admin_auth', 'true');
        loadData();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Authentication server error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cinevault_admin_auth');
  };

  // Auto-slug generator
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setMovieForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug && isEditing ? prev.slug : slug,
      metaTitle: `${title} – Movie Information, Poster & Details | CineVault`,
      metaDescription: `Explore ${title} movie storyline, cast, director, high speed downloads in 1080p, 720p, 360p.`
    }));
  };

  // Real File Upload & Size Calculation Handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'poster' | 'backdrop' | 'quality_360' | 'quality_720' | 'quality_1080'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileKey = type;
    setUploadProgress((prev) => ({ ...prev, [fileKey]: 10 }));
    setUploadStatus((prev) => ({ ...prev, [fileKey]: 'Reading file & calculating checksum...' }));

    // Read file via FileReader
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadProgress((prev) => ({ ...prev, [fileKey]: 45 }));
      setUploadStatus((prev) => ({ ...prev, [fileKey]: 'Uploading to secure object storage...' }));

      try {
        const qualityName = type.startsWith('quality_') ? type.replace('quality_', '') : undefined;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data,
            quality: qualityName
          })
        });

        const data = await res.json();
        if (data.success) {
          setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));
          setUploadStatus((prev) => ({ ...prev, [fileKey]: `Uploaded successfully (${data.data.fileSizeDisplay})` }));

          if (type === 'poster') {
            setMovieForm((prev) => ({ ...prev, posterUrl: data.data.fileUrl }));
          } else if (type === 'backdrop') {
            setMovieForm((prev) => ({ ...prev, backdropUrl: data.data.fileUrl }));
          } else if (type.startsWith('quality_')) {
            const qTarget = type.replace('quality_', '') as VideoQualityLevel;
            setMovieForm((prev) => ({
              ...prev,
              qualities: prev.qualities.map((item) =>
                item.quality === qTarget
                  ? {
                      ...item,
                      fileName: data.data.fileName,
                      fileFormat: data.data.fileFormat,
                      fileSizeBytes: data.data.fileSizeBytes,
                      fileSizeDisplay: data.data.fileSizeDisplay,
                      downloadUrl: data.data.fileUrl,
                      isAvailable: true
                    }
                  : item
              )
            }));
          }
          showToast(`File ${file.name} uploaded (${data.data.fileSizeDisplay})`);
        } else {
          setUploadStatus((prev) => ({ ...prev, [fileKey]: 'Upload error' }));
        }
      } catch (err) {
        setUploadStatus((prev) => ({ ...prev, [fileKey]: 'Server upload failed' }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Movie (Add or Edit)
  const handleSubmitMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieForm.title || !movieForm.slug) {
      showToast('Title and URL slug are mandatory');
      return;
    }

    const payload = {
      ...movieForm,
      cast: typeof movieForm.cast === 'string' ? movieForm.cast.split(',').map((s) => s.trim()) : movieForm.cast,
      keywords: typeof movieForm.keywords === 'string' ? movieForm.keywords.split(',').map((s) => s.trim()) : movieForm.keywords
    };

    try {
      if (isEditing && editingMovieId) {
        const res = await fetch(`/api/movies/${editingMovieId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Movie updated successfully!');
          resetMovieForm();
          loadData();
          onRefreshLibrary();
          setActiveTab('movies');
        }
      } else {
        const res = await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Movie added & published to library!');
          resetMovieForm();
          loadData();
          onRefreshLibrary();
          setActiveTab('movies');
        }
      }
    } catch (e) {
      showToast('Error saving movie');
    }
  };

  const resetMovieForm = () => {
    setIsEditing(false);
    setEditingMovieId(null);
    setMovieForm({
      title: '',
      altTitle: '',
      slug: '',
      releaseYear: new Date().getFullYear(),
      language: 'English',
      genres: ['Action'],
      description: '',
      director: '',
      cast: '',
      imdbRating: 8.0,
      runtime: '120 min',
      keywords: '',
      metaTitle: '',
      metaDescription: '',
      category: 'Latest',
      posterUrl: '',
      backdropUrl: '',
      previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      status: 'published',
      qualities: [
        {
          id: 'q-360',
          quality: '360p',
          fileName: 'movie_360p.mp4',
          fileFormat: 'MP4',
          fileSizeBytes: 262144000,
          fileSizeDisplay: '250 MB',
          downloadUrl: '',
          isAvailable: true
        },
        {
          id: 'q-720',
          quality: '720p',
          fileName: 'movie_720p.mp4',
          fileFormat: 'MP4',
          fileSizeBytes: 891289600,
          fileSizeDisplay: '850 MB',
          downloadUrl: '',
          isAvailable: true
        },
        {
          id: 'q-1080',
          quality: '1080p',
          fileName: 'movie_1080p.mkv',
          fileFormat: 'MKV',
          fileSizeBytes: 1932735283,
          fileSizeDisplay: '1.8 GB',
          downloadUrl: '',
          isAvailable: true
        }
      ]
    });
    setUploadProgress({});
    setUploadStatus({});
  };

  const handleEditMovie = (movie: Movie) => {
    setIsEditing(true);
    setEditingMovieId(movie.id);
    setMovieForm({
      title: movie.title,
      altTitle: movie.altTitle || '',
      slug: movie.slug,
      releaseYear: movie.releaseYear,
      language: movie.language,
      genres: movie.genres,
      description: movie.description,
      director: movie.director,
      cast: movie.cast.join(', '),
      imdbRating: movie.imdbRating || 8.0,
      runtime: movie.runtime,
      keywords: movie.keywords.join(', '),
      metaTitle: movie.metaTitle,
      metaDescription: movie.metaDescription,
      category: movie.category,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl || '',
      previewVideoUrl: movie.previewVideoUrl || '',
      status: movie.status,
      qualities: movie.qualities
    });
    setActiveTab('upload');
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Movie deleted');
        loadData();
        onRefreshLibrary();
      }
    } catch (e) {
      showToast('Error deleting movie');
    }
  };

  // Toggle Ad enabled state
  const handleToggleAd = async (ad: AdConfiguration) => {
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !ad.enabled })
      });
      const data = await res.json();
      if (data.success) {
        setAds((prev) => prev.map((a) => (a.id === ad.id ? data.data : a)));
        showToast(`Updated ad: ${ad.name}`);
      }
    } catch (e) {
      showToast('Error updating ad');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Website settings saved!');
      }
    } catch (e) {
      showToast('Error saving settings');
    }
  };

  // LOGIN SCREEN FOR UNAUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07090e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white font-['Outfit']">Admin Portal</h2>
            <p className="text-xs text-slate-400">
              Restricted management console for authorized CineVault administrators
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default demo: admin12345</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-amber-600/20"
            >
              Authenticate & Enter Dashboard
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#07090e] text-slate-100 flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="h-14 bg-[#0d111a] border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold font-['Outfit'] text-white">
            Cine<span className="text-rose-500">Vault</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            Admin Management
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin Body Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-56 bg-[#090c14] border-r border-slate-800 flex flex-col justify-between p-3 shrink-0">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Stats</span>
            </button>

            <button
              onClick={() => {
                resetMovieForm();
                setActiveTab('upload');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isEditing ? 'Edit Movie' : 'Upload Movie'}</span>
            </button>

            <button
              onClick={() => setActiveTab('movies')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'movies' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>All Movies ({movies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ads' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Ad Management</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'storage' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Storage System</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Settings</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-200 font-bold block mb-1">CineVault Cloud Node</span>
            <span>Version: 3.2 Production</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#07090e]">
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Outfit']">Dashboard Overview</h2>
                  <p className="text-xs text-slate-400">Real-time telemetry and movie catalog statistics</p>
                </div>
                <button
                  onClick={() => {
                    resetMovieForm();
                    setActiveTab('upload');
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New Movie</span>
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Movies</span>
                  <div className="text-2xl font-extrabold text-white">{stats.totalMovies}</div>
                  <span className="text-[11px] text-emerald-400">{stats.publishedMoviesCount} Published · {stats.draftsCount} Drafts</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Movie Views</span>
                  <div className="text-2xl font-extrabold text-white">{stats.totalViews.toLocaleString()}</div>
                  <span className="text-[11px] text-rose-400 flex items-center gap-1"><Eye className="w-3 h-3" /> Live user pageviews</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Downloads</span>
                  <div className="text-2xl font-extrabold text-white">{stats.totalDownloads.toLocaleString()}</div>
                  <span className="text-[11px] text-blue-400 flex items-center gap-1"><Download className="w-3 h-3" /> CDN downloads served</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Storage Used</span>
                  <div className="text-2xl font-extrabold text-amber-400">{stats.totalStorageUsedDisplay}</div>
                  <span className="text-[11px] text-slate-400">Out of 1,024 GB Pool</span>
                </div>
              </div>

              {/* Recently Uploaded Movies Table */}
              <div className="bg-[#0f1422] border border-slate-800 rounded-xl overflow-hidden space-y-3">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-['Outfit']">Recently Uploaded Movies</h3>
                  <button onClick={() => setActiveTab('movies')} className="text-xs text-rose-400 hover:underline">
                    View All ({movies.length}) →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Movie</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Qualities</th>
                        <th className="px-4 py-3">Views</th>
                        <th className="px-4 py-3">Downloads</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {movies.slice(0, 5).map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img src={m.posterUrl} alt="" className="w-8 h-11 object-cover rounded bg-slate-800" />
                            <div>
                              <span className="font-semibold text-white block">{m.title}</span>
                              <span className="text-[11px] text-slate-400">{m.language}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{m.category}</td>
                          <td className="px-4 py-3">{m.releaseYear}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {m.qualities.filter((q) => q.isAvailable).map((q) => (
                                <span key={q.quality} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-200">
                                  {q.quality}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">{m.views?.toLocaleString()}</td>
                          <td className="px-4 py-3">{m.downloads?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleEditMovie(m)}
                              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                              title="Edit Movie"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(m.id, m.title)}
                              className="p-1 rounded bg-rose-950/60 text-rose-400 hover:text-rose-200"
                              title="Delete Movie"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVIE UPLOAD SYSTEM (Complete fields) */}
          {activeTab === 'upload' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Outfit']">
                  {isEditing ? 'Edit Movie Information' : 'Movie Upload System'}
                </h2>
                <p className="text-xs text-slate-400">
                  Fill in all metadata, upload posters, backdrops, and multiple video quality versions (360p, 720p, 1080p).
                </p>
              </div>

              <form onSubmit={handleSubmitMovie} className="space-y-6 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
                {/* 1. Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                    1. Movie Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Movie Title *</label>
                      <input
                        type="text"
                        value={movieForm.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Ramayana: The Legend Begins"
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Alternative Title</label>
                      <input
                        type="text"
                        value={movieForm.altTitle}
                        onChange={(e) => setMovieForm({ ...movieForm, altTitle: e.target.value })}
                        placeholder="e.g. Ramayana – The Epic Heritage Film"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Movie Slug (SEO URL) *</label>
                      <input
                        type="text"
                        value={movieForm.slug}
                        onChange={(e) => setMovieForm({ ...movieForm, slug: e.target.value })}
                        placeholder="ramayana-the-legend"
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-rose-400 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Release Year *</label>
                      <input
                        type="number"
                        value={movieForm.releaseYear}
                        onChange={(e) => setMovieForm({ ...movieForm, releaseYear: parseInt(e.target.value, 10) })}
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Language *</label>
                      <input
                        type="text"
                        value={movieForm.language}
                        onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                        placeholder="Hindi, English, Telugu..."
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                      <select
                        value={movieForm.category}
                        onChange={(e) => setMovieForm({ ...movieForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">IMDb Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={movieForm.imdbRating}
                        onChange={(e) => setMovieForm({ ...movieForm, imdbRating: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Runtime</label>
                      <input
                        type="text"
                        value={movieForm.runtime}
                        onChange={(e) => setMovieForm({ ...movieForm, runtime: e.target.value })}
                        placeholder="e.g. 142 min"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Director</label>
                      <input
                        type="text"
                        value={movieForm.director}
                        onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                        placeholder="Director name"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Starring Cast (comma separated)</label>
                      <input
                        type="text"
                        value={movieForm.cast}
                        onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                        placeholder="Actor 1, Actor 2, Actor 3"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Movie Storyline / Description *</label>
                    <textarea
                      rows={3}
                      value={movieForm.description}
                      onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      placeholder="Write an engaging synopsis..."
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* 2. Visual Media Uploads (Poster & Backdrop) */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    2. Poster & Backdrop Artwork
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Poster */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-rose-400" /> Movie Poster
                        </label>
                        {movieForm.posterUrl && (
                          <span className="text-[10px] text-emerald-400">Attached</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'poster')}
                        className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-500"
                      />
                      <input
                        type="text"
                        value={movieForm.posterUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                        placeholder="Or enter poster image URL"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300"
                      />
                      {uploadStatus['poster'] && (
                        <p className="text-[11px] text-amber-400">{uploadStatus['poster']}</p>
                      )}
                    </div>

                    {/* Backdrop */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-blue-400" /> Movie Backdrop Banner
                        </label>
                        {movieForm.backdropUrl && (
                          <span className="text-[10px] text-emerald-400">Attached</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'backdrop')}
                        className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                      />
                      <input
                        type="text"
                        value={movieForm.backdropUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, backdropUrl: e.target.value })}
                        placeholder="Or enter backdrop image URL"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300"
                      />
                      {uploadStatus['backdrop'] && (
                        <p className="text-[11px] text-amber-400">{uploadStatus['backdrop']}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. MULTIPLE VIDEO QUALITY VERSIONS (360p, 720p, 1080p) */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileVideo className="w-4 h-4 text-rose-500" />
                        3. Video Quality Versions & Automatic File Size Calculation
                      </h3>
                      <p className="text-xs text-slate-400">
                        Upload authorized movie files for each resolution or configure high-speed streaming links.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 360p */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">360p Standard Quality</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                          {movieForm.qualities.find((q) => q.quality === '360p')?.fileSizeDisplay || '250 MB'}
                        </span>
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'quality_360')}
                        className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-800 file:text-white"
                      />
                      <input
                        type="text"
                        value={movieForm.qualities.find((q) => q.quality === '360p')?.fileName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMovieForm((prev) => ({
                            ...prev,
                            qualities: prev.qualities.map((q) => (q.quality === '360p' ? { ...q, fileName: val } : q))
                          }));
                        }}
                        placeholder="File Name (e.g. Movie_360p.mp4)"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 font-mono"
                      />
                      {uploadStatus['quality_360'] && (
                        <span className="text-[10px] text-emerald-400 block">{uploadStatus['quality_360']}</span>
                      )}
                    </div>

                    {/* 720p */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-blue-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400">720p HD Quality</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-[10px] font-bold text-blue-300">
                          {movieForm.qualities.find((q) => q.quality === '720p')?.fileSizeDisplay || '850 MB'}
                        </span>
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'quality_720')}
                        className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-blue-600 file:text-white"
                      />
                      <input
                        type="text"
                        value={movieForm.qualities.find((q) => q.quality === '720p')?.fileName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMovieForm((prev) => ({
                            ...prev,
                            qualities: prev.qualities.map((q) => (q.quality === '720p' ? { ...q, fileName: val } : q))
                          }));
                        }}
                        placeholder="File Name (e.g. Movie_720p.mp4)"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 font-mono"
                      />
                      {uploadStatus['quality_720'] && (
                        <span className="text-[10px] text-emerald-400 block">{uploadStatus['quality_720']}</span>
                      )}
                    </div>

                    {/* 1080p */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400">1080p Full HD Master</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-900/40 text-[10px] font-bold text-rose-300">
                          {movieForm.qualities.find((q) => q.quality === '1080p')?.fileSizeDisplay || '1.8 GB'}
                        </span>
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'quality_1080')}
                        className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-rose-600 file:text-white"
                      />
                      <input
                        type="text"
                        value={movieForm.qualities.find((q) => q.quality === '1080p')?.fileName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMovieForm((prev) => ({
                            ...prev,
                            qualities: prev.qualities.map((q) => (q.quality === '1080p' ? { ...q, fileName: val } : q))
                          }));
                        }}
                        placeholder="File Name (e.g. Movie_1080p.mkv)"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 font-mono"
                      />
                      {uploadStatus['quality_1080'] && (
                        <span className="text-[10px] text-emerald-400 block">{uploadStatus['quality_1080']}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. SEO & Status */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    4. SEO Optimization & Publishing Status
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={movieForm.metaTitle}
                        onChange={(e) => setMovieForm({ ...movieForm, metaTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Searchable Keywords (comma separated)</label>
                      <input
                        type="text"
                        value={movieForm.keywords}
                        onChange={(e) => setMovieForm({ ...movieForm, keywords: e.target.value })}
                        placeholder="movie download, ramayana, 1080p..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-xs font-semibold text-slate-300">Publishing Status:</label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={movieForm.status === 'published'}
                        onChange={() => setMovieForm({ ...movieForm, status: 'published' })}
                        className="text-rose-600"
                      />
                      <span>Published (Live)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={movieForm.status === 'draft'}
                        onChange={() => setMovieForm({ ...movieForm, status: 'draft' })}
                        className="text-amber-500"
                      />
                      <span>Save as Draft</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetMovieForm}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
                  >
                    {isEditing ? 'Save Changes' : 'Publish Movie to Library'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ALL MOVIES MANAGEMENT */}
          {activeTab === 'movies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Outfit']">All Movies in Database</h2>
                  <p className="text-xs text-slate-400">Total {movies.length} movies indexed</p>
                </div>
                <button
                  onClick={() => {
                    resetMovieForm();
                    setActiveTab('upload');
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Movie
                </button>
              </div>

              <div className="bg-[#0f1422] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Movie</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Director</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Views</th>
                      <th className="px-4 py-3">Downloads</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {movies.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img src={m.posterUrl} alt="" className="w-9 h-12 object-cover rounded bg-slate-800 shrink-0" />
                          <div>
                            <span className="font-semibold text-white block">{m.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono">/movie/{m.slug}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{m.category}</td>
                        <td className="px-4 py-3">{m.director}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'published' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{m.views?.toLocaleString()}</td>
                        <td className="px-4 py-3">{m.downloads?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditMovie(m)}
                            className="p-1.5 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(m.id, m.title)}
                            className="p-1.5 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADVERTISEMENT MANAGEMENT (All 7 required scripts) */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Outfit']">Advertisement Management System</h2>
                <p className="text-xs text-slate-400">
                  Control all 7 ad scripts provided. Enable or disable placements without editing source code.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="p-5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{ad.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {ad.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{ad.description}</p>
                      </div>

                      <button
                        onClick={() => handleToggleAd(ad)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          ad.enabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ad.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {/* Ad Key / Script URL snippet preview */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 break-all select-all">
                      {ad.rawHtmlSnippet}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                      <span>Placements: {ad.placements.join(', ')}</span>
                      <span>{ad.impressionsCount?.toLocaleString()} Impressions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STORAGE MANAGEMENT */}
          {activeTab === 'storage' && stats && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Outfit']">Storage & Object System</h2>
                <p className="text-xs text-slate-400">
                  Resumable storage pool, asset distributions, and disk metrics
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Storage Pool</span>
                  <div className="text-2xl font-extrabold text-white">1,024 GB (1 TB)</div>
                  <span className="text-[11px] text-slate-500">Tier 1 Cloud Object Store</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Used Storage</span>
                  <div className="text-2xl font-extrabold text-amber-400">{stats.totalStorageUsedDisplay}</div>
                  <span className="text-[11px] text-emerald-400">Verified file assets</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Available Free Space</span>
                  <div className="text-2xl font-extrabold text-emerald-400">
                    {(1024 - parseFloat(stats.totalStorageUsedDisplay || '0')).toFixed(2)} GB
                  </div>
                  <span className="text-[11px] text-slate-400">Ready for incoming movie uploads</span>
                </div>
              </div>

              {/* Individual movie sizes */}
              <div className="bg-[#0f1422] border border-slate-800 rounded-xl overflow-hidden p-5 space-y-3">
                <h3 className="text-sm font-bold text-white font-['Outfit']">Individual Movie File Allocations</h3>
                <div className="divide-y divide-slate-800">
                  {movies.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{m.title}</span>
                      <div className="flex items-center gap-3">
                        {m.qualities.map((q) => (
                          <span key={q.quality} className="text-slate-400">
                            {q.quality}: <strong className="text-white">{q.fileSizeDisplay}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WEBSITE SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Outfit']">Website & SEO Settings</h2>
                <p className="text-xs text-slate-400">Configure global metadata, branding, and contact details</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Website Brand Name</label>
                  <input
                    type="text"
                    value={settings.websiteName}
                    onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settings.websiteTagline}
                    onChange={(e) => setSettings({ ...settings, websiteTagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Global Meta Description</label>
                  <textarea
                    rows={2}
                    value={settings.websiteDescription}
                    onChange={(e) => setSettings({ ...settings, websiteDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowGuestDownloads}
                      onChange={(e) => setSettings({ ...settings, allowGuestDownloads: e.target.checked })}
                    />
                    <span>Allow Guest Visitors to Download</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    />
                    <span>Maintenance Mode</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
                  >
                    Save Global Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
