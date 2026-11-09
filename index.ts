export type MovieCategory =
  | 'Latest'
  | 'Popular'
  | 'Trending'
  | 'Recently Added'
  | 'Hollywood'
  | 'Bollywood'
  | 'South Indian'
  | 'Animated'
  | 'Web Series';

export type VideoQualityLevel = '360p' | '720p' | '1080p';

export interface MovieQuality {
  id: string;
  quality: VideoQualityLevel;
  fileName: string;
  fileFormat: string;
  fileSizeBytes: number;
  fileSizeDisplay: string; // e.g. "250 MB", "850 MB", "1.8 GB"
  downloadUrl: string;
  isAvailable: boolean;
}

export interface Movie {
  id: string;
  title: string;
  altTitle?: string;
  slug: string;
  releaseYear: number;
  language: string;
  genres: string[];
  description: string;
  director: string;
  cast: string[];
  imdbRating?: number;
  runtime: string; // e.g. "124 min"
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  category: MovieCategory;
  posterUrl: string;
  backdropUrl?: string;
  previewVideoUrl?: string;
  qualities: MovieQuality[];
  status: 'published' | 'draft' | 'unpublished';
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export type AdPlacementType =
  | 'popunder'
  | 'social_bar'
  | 'native_banner'
  | 'banner_300x250'
  | 'banner_468x60'
  | 'banner_160x600'
  | 'banner_160x300';

export interface AdConfiguration {
  id: string;
  name: string;
  type: AdPlacementType;
  description: string;
  enabled: boolean;
  scriptUrl?: string;
  containerId?: string;
  adKey?: string;
  dimensions?: { width: number; height: number };
  rawHtmlSnippet?: string;
  placements: ('homepage_header' | 'homepage_between_sections' | 'homepage_footer' | 'details_below_info' | 'details_near_downloads' | 'details_sidebar' | 'download_page')[];
  impressionsCount: number;
  clicksCount: number;
}

export interface WebsiteSettings {
  websiteName: string;
  websiteTagline: string;
  websiteLogoUrl: string;
  websiteFaviconUrl: string;
  websiteDescription: string;
  contactEmail: string;
  socialLinks: {
    telegram?: string;
    twitter?: string;
    discord?: string;
    facebook?: string;
  };
  seoDefaults: {
    titleTemplate: string;
    defaultMetaDescription: string;
    defaultKeywords: string[];
    enableSitemap: boolean;
  };
  maintenanceMode: boolean;
  allowGuestDownloads: boolean;
  totalStorageCapGB: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  favorites: string[]; // movie IDs
  downloadHistory: {
    movieId: string;
    movieTitle: string;
    quality: VideoQualityLevel;
    downloadedAt: string;
    fileSizeDisplay: string;
  }[];
  createdAt: string;
}

export interface AdminStats {
  totalMovies: number;
  totalViews: number;
  totalDownloads: number;
  totalCategories: number;
  totalStorageUsedBytes: number;
  totalStorageUsedDisplay: string;
  totalUsers: number;
  publishedMoviesCount: number;
  draftsCount: number;
}
