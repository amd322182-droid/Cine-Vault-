import fs from 'fs';
import path from 'path';
import { Movie, AdConfiguration, WebsiteSettings, UserAccount, AdminStats } from '../src/types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

interface DatabaseSchema {
  movies: Movie[];
  ads: AdConfiguration[];
  settings: WebsiteSettings;
  users: UserAccount[];
  admins: { id: string; email: string; passwordHash: string; name: string }[];
  categories: string[];
  genres: string[];
}

const DEFAULT_CATEGORIES = [
  'Latest',
  'Popular',
  'Trending',
  'Recently Added',
  'Hollywood',
  'Bollywood',
  'South Indian',
  'Animated',
  'Web Series'
];

const DEFAULT_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Crime',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Mythology',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Documentary'
];

const DEFAULT_ADS: AdConfiguration[] = [
  {
    id: 'ad_popunder',
    name: 'Popunder Network Ad',
    type: 'popunder',
    description: 'High CPM Popunder script that opens a sponsor tab on primary click intent.',
    enabled: true,
    scriptUrl: 'https://pl32269467.profitableratecpmnetwork.com/46/56/0c/46560cd5dfd9a2571fa19e9e2b1069b7.js',
    rawHtmlSnippet: `<script src="https://pl32269467.profitableratecpmnetwork.com/46/56/0c/46560cd5dfd9a2571fa19e9e2b1069b7.js"></script>`,
    placements: ['homepage_header', 'details_below_info'],
    impressionsCount: 12450,
    clicksCount: 382
  },
  {
    id: 'ad_social_bar',
    name: 'Interactive Social Bar',
    type: 'social_bar',
    description: 'Bottom floating social engagement and sponsored alert bar.',
    enabled: true,
    scriptUrl: 'https://pl32269468.profitableratecpmnetwork.com/c6/62/ce/c662ceed042b51f23f4595cc91bd2c64.js',
    rawHtmlSnippet: `<script src="https://pl32269468.profitableratecpmnetwork.com/c6/62/ce/c662ceed042b51f23f4595cc91bd2c64.js"></script>`,
    placements: ['homepage_footer', 'details_below_info'],
    impressionsCount: 8930,
    clicksCount: 245
  },
  {
    id: 'ad_native_banner',
    name: 'Native Recommended Media Banner',
    type: 'native_banner',
    description: 'Fluid native grid ad matching entertainment and streaming style.',
    enabled: true,
    scriptUrl: 'https://bancadeltempoidea.org/21/4ffb108cabdd6aa64223619791f05e54',
    containerId: 'container-4ffb108cabdd6aa64223619791f05e54',
    rawHtmlSnippet: `<script async="async" data-cfasync="false" src="https://bancadeltempoidea.org/21/4ffb108cabdd6aa64223619791f05e54"></script><div id="container-4ffb108cabdd6aa64223619791f05e54"></div>`,
    placements: ['homepage_between_sections', 'details_near_downloads'],
    impressionsCount: 15420,
    clicksCount: 512
  },
  {
    id: 'ad_banner_300x250',
    name: 'Medium Rectangle Banner (300x250)',
    type: 'banner_300x250',
    description: 'High converting rectangular banner for details sidebar and download area.',
    enabled: true,
    adKey: 'ae96d29662aaa9791d8929ce442b3a24',
    dimensions: { width: 300, height: 250 },
    rawHtmlSnippet: `<script>  atOptions = {    'key' : 'ae96d29662aaa9791d8929ce442b3a24',    'format' : 'iframe',    'height' : 250,    'width' : 300,    'params' : {}  };</script><script src="https://www.highrevenueformat.com/ae96d29662aaa9791d8929ce442b3a24/invoke.js"></script>`,
    placements: ['details_below_info', 'download_page'],
    impressionsCount: 21300,
    clicksCount: 890
  },
  {
    id: 'ad_banner_468x60',
    name: 'Standard Leaderboard Banner (468x60)',
    type: 'banner_468x60',
    description: 'Top header and footer horizontal banner.',
    enabled: true,
    adKey: 'fe1e4ca550ca71ca34b0216953a6f63e',
    dimensions: { width: 468, height: 60 },
    rawHtmlSnippet: `<script>  atOptions = {    'key' : 'fe1e4ca550ca71ca34b0216953a6f63e',    'format' : 'iframe',    'height' : 60,    'width' : 468,    'params' : {}  };</script><script src="https://bancadeltempoidea.org/22/fe1e4ca550ca71ca34b0216953a6f63e"></script>`,
    placements: ['homepage_header', 'homepage_footer'],
    impressionsCount: 17800,
    clicksCount: 420
  },
  {
    id: 'ad_banner_160x600',
    name: 'Wide Skyscraper Banner (160x600)',
    type: 'banner_160x600',
    description: 'Tall side display ad for desktop cinema viewports.',
    enabled: true,
    adKey: '653f82cd18503550daa27c4c1a952e94',
    dimensions: { width: 160, height: 600 },
    rawHtmlSnippet: `<script>  atOptions = {    'key' : '653f82cd18503550daa27c4c1a952e94',    'format' : 'iframe',    'height' : 600,    'width' : 160,    'params' : {}  };</script><script src="https://bancadeltempoidea.org/22/653f82cd18503550daa27c4c1a952e94"></script>`,
    placements: ['details_sidebar'],
    impressionsCount: 9400,
    clicksCount: 195
  },
  {
    id: 'ad_banner_160x300',
    name: 'Compact Skyscraper Banner (160x300)',
    type: 'banner_160x300',
    description: 'Compact vertical banner for side rails and responsive column margins.',
    enabled: true,
    adKey: 'c45a92a4e82a51e5b797f00feecd23b1',
    dimensions: { width: 160, height: 300 },
    rawHtmlSnippet: `<script>  atOptions = {    'key' : 'c45a92a4e82a51e5b797f00feecd23b1',    'format' : 'iframe',    'height' : 300,    'width' : 160,    'params' : {}  };</script><script src="https://bancadeltempoidea.org/22/c45a92a4e82a51e5b797f00feecd23b1"></script>`,
    placements: ['details_sidebar'],
    impressionsCount: 7200,
    clicksCount: 162
  }
];

const DEFAULT_SETTINGS: WebsiteSettings = {
  websiteName: 'CineVault',
  websiteTagline: 'Professional Movie Library & High-Speed Media Downloads',
  websiteLogoUrl: '',
  websiteFaviconUrl: '',
  websiteDescription: 'Stream and download authorized full-length movies, restored cinema masterpieces, and open culture films in 1080p FHD, 720p HD, and 360p SD.',
  contactEmail: 'support@cinevault.org',
  socialLinks: {
    telegram: 'https://t.me/cinevault',
    twitter: 'https://twitter.com/cinevault',
    discord: 'https://discord.gg/cinevault'
  },
  seoDefaults: {
    titleTemplate: '%s – Movie Information, Poster & Download | CineVault',
    defaultMetaDescription: 'Explore movie information, story details, cast, release year, poster and available viewing and download options on CineVault.',
    defaultKeywords: ['movie download', 'free hd movies', 'public domain cinema', '1080p movie library', 'cinevault'],
    enableSitemap: true
  },
  maintenanceMode: false,
  allowGuestDownloads: true,
  totalStorageCapGB: 1024
};

const SEED_MOVIES: Movie[] = [
  {
    id: 'mv-ramayana',
    title: 'Ramayana: The Legend Begins',
    altTitle: 'Ramayana – The Epic Heritage Film',
    slug: 'ramayana',
    releaseYear: 2024,
    language: 'Hindi',
    genres: ['Mythology', 'Action', 'Fantasy'],
    description: 'A grand cinematic journey recounting the timeless legend of Prince Rama, his exile into the ancient forests, the devotion of Hanuman, and the titanic war to rescue Sita from Lanka. Featuring breathtaking visuals, spiritual grandeur, and sweeping battle sequences.',
    director: 'Nitesh Tiwari & V. V. Prasad',
    cast: ['Ranbir Kapoor', 'Sai Pallavi', 'Yash', 'Sunny Deol', 'Lara Dutta'],
    imdbRating: 8.9,
    runtime: '168 min',
    keywords: ['ramayana', 'hindi epic', 'ramayana movie download', 'mythological movie', 'valmiki ramayana', 'yash raavan'],
    metaTitle: 'Ramayana – Movie Information, Poster & Details | CineVault',
    metaDescription: 'Explore Ramayana movie information, story details, cast, release year, poster and available viewing options on CineVault.',
    category: 'Bollywood',
    posterUrl: '/src/assets/images/poster_ramayana_epic_1794202759008.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    qualities: [
      {
        id: 'q-ramayana-360',
        quality: '360p',
        fileName: 'Ramayana_The_Legend_Begins_2024_360p_HEVC.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 398458880,
        fileSizeDisplay: '380 MB',
        downloadUrl: '/api/movies/mv-ramayana/download/360p',
        isAvailable: true
      },
      {
        id: 'q-ramayana-720',
        quality: '720p',
        fileName: 'Ramayana_The_Legend_Begins_2024_720p_WEBDL.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 1027604480,
        fileSizeDisplay: '980 MB',
        downloadUrl: '/api/movies/mv-ramayana/download/720p',
        isAvailable: true
      },
      {
        id: 'q-ramayana-1080',
        quality: '1080p',
        fileName: 'Ramayana_The_Legend_Begins_2024_1080p_FHD_DTS.mkv',
        fileFormat: 'MKV',
        fileSizeBytes: 2469606400,
        fileSizeDisplay: '2.3 GB',
        downloadUrl: '/api/movies/mv-ramayana/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 48920,
    downloads: 18450,
    createdAt: '2026-10-15T12:00:00.000Z',
    updatedAt: '2026-11-01T08:30:00.000Z'
  },
  {
    id: 'mv-neon-rain',
    title: 'Neon Rain 2049',
    altTitle: 'Cyber City: Dark Protocol',
    slug: 'neon-rain-2049',
    releaseYear: 2025,
    language: 'English',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    description: 'In a rain-drenched cybernetic metropolis controlled by algorithmic cartels, an augmented investigator uncovers a memory black-market that threatens the synthetic consciousness of human civilization.',
    director: 'Ridley Scott & Dennis Ward',
    cast: ['Ryan Gosling', 'Ana de Armas', 'Sylvia Hoeks', 'Mackenzie Davis'],
    imdbRating: 8.4,
    runtime: '142 min',
    keywords: ['cyberpunk', 'sci-fi movie download', 'neon rain', 'blade runner style', 'neo noir 2049'],
    metaTitle: 'Neon Rain 2049 – Full Movie Download 1080p 720p | CineVault',
    metaDescription: 'Watch and download Neon Rain 2049 sci-fi neo-noir thriller. High speed download in 1080p and 720p.',
    category: 'Hollywood',
    posterUrl: '/src/assets/images/poster_neon_cyberpunk_1794202759623.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    qualities: [
      {
        id: 'q-neon-360',
        quality: '360p',
        fileName: 'Neon_Rain_2049_360p_Mobile.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 314572800,
        fileSizeDisplay: '300 MB',
        downloadUrl: '/api/movies/mv-neon-rain/download/360p',
        isAvailable: true
      },
      {
        id: 'q-neon-720',
        quality: '720p',
        fileName: 'Neon_Rain_2049_720p_HD.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 891289600,
        fileSizeDisplay: '850 MB',
        downloadUrl: '/api/movies/mv-neon-rain/download/720p',
        isAvailable: true
      },
      {
        id: 'q-neon-1080',
        quality: '1080p',
        fileName: 'Neon_Rain_2049_1080p_BluRay_x264.mkv',
        fileFormat: 'MKV',
        fileSizeBytes: 1992294400,
        fileSizeDisplay: '1.85 GB',
        downloadUrl: '/api/movies/mv-neon-rain/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 32410,
    downloads: 14200,
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-11-02T14:10:00.000Z'
  },
  {
    id: 'mv-shadowed-street',
    title: 'The Shadowed Street',
    altTitle: 'Midnight Syndicate',
    slug: 'the-shadowed-street',
    releaseYear: 1953,
    language: 'English',
    genres: ['Crime', 'Mystery', 'Drama'],
    description: 'A classic restored film-noir masterpiece. Detective Vince Cross roams the rainy streets searching for answers after his partner is ambushed outside the city docks, unearthing corrupt city hall secrets.',
    director: 'Anthony Mann',
    cast: ['Roderick Storm', 'Carla Vance', 'Vincent Corey', 'Arthur Hale'],
    imdbRating: 8.1,
    runtime: '98 min',
    keywords: ['classic noir', 'public domain movie', 'shadowed street', 'crime drama', 'vintage cinema'],
    metaTitle: 'The Shadowed Street (1953) – Classic Film Noir | CineVault',
    metaDescription: 'Stream and download restored classic noir film The Shadowed Street. Public domain digital archive in HD.',
    category: 'Popular',
    posterUrl: '/src/assets/images/poster_vintage_detective_1794202758894.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    qualities: [
      {
        id: 'q-shadow-360',
        quality: '360p',
        fileName: 'The_Shadowed_Street_1953_360p_Restored.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 220200960,
        fileSizeDisplay: '210 MB',
        downloadUrl: '/api/movies/mv-shadowed-street/download/360p',
        isAvailable: true
      },
      {
        id: 'q-shadow-720',
        quality: '720p',
        fileName: 'The_Shadowed_Street_1953_720p_HD_Remaster.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 671088640,
        fileSizeDisplay: '640 MB',
        downloadUrl: '/api/movies/mv-shadowed-street/download/720p',
        isAvailable: true
      },
      {
        id: 'q-shadow-1080',
        quality: '1080p',
        fileName: 'The_Shadowed_Street_1953_1080p_Criterion_FHD.mkv',
        fileFormat: 'MKV',
        fileSizeBytes: 1468006400,
        fileSizeDisplay: '1.37 GB',
        downloadUrl: '/api/movies/mv-shadowed-street/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 19800,
    downloads: 7850,
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-10-25T11:20:00.000Z'
  },
  {
    id: 'mv-sita-sings-the-blues',
    title: 'Sita Sings the Blues',
    altTitle: 'Sita and the Jazz Melody',
    slug: 'sita-sings-the-blues',
    releaseYear: 2008,
    language: 'English',
    genres: ['Animation', 'Mythology', 'Comedy', 'Fantasy'],
    description: 'An acclaimed animated musical romance film written, directed, produced and animated by American artist Nina Paley. It juxtaposes the Indian epic Ramayana with the jazz vocals of Annette Hanshaw and personal biographical reflections.',
    director: 'Nina Paley',
    cast: ['Annette Hanshaw (voice)', 'Aseem Chhabra', 'Bhavana Nagulapally', 'Manish Acharya'],
    imdbRating: 7.6,
    runtime: '82 min',
    keywords: ['sita sings the blues', 'open source animation', 'creative commons movie', 'animated ramayana', 'jazz music film'],
    metaTitle: 'Sita Sings the Blues – Free Animated Movie Download | CineVault',
    metaDescription: 'Download Nina Paley’s Creative Commons animated masterpiece Sita Sings the Blues in 1080p and 720p.',
    category: 'Animated',
    posterUrl: '/src/assets/images/poster_ramayana_epic_1794202759008.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    qualities: [
      {
        id: 'q-sita-360',
        quality: '360p',
        fileName: 'Sita_Sings_The_Blues_360p.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 188743680,
        fileSizeDisplay: '180 MB',
        downloadUrl: '/api/movies/mv-sita-sings-the-blues/download/360p',
        isAvailable: true
      },
      {
        id: 'q-sita-720',
        quality: '720p',
        fileName: 'Sita_Sings_The_Blues_720p_HD.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 545259520,
        fileSizeDisplay: '520 MB',
        downloadUrl: '/api/movies/mv-sita-sings-the-blues/download/720p',
        isAvailable: true
      },
      {
        id: 'q-sita-1080',
        quality: '1080p',
        fileName: 'Sita_Sings_The_Blues_1080p_FHD.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 1258291200,
        fileSizeDisplay: '1.17 GB',
        downloadUrl: '/api/movies/mv-sita-sings-the-blues/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 28400,
    downloads: 11200,
    createdAt: '2026-10-02T15:00:00.000Z',
    updatedAt: '2026-11-04T09:15:00.000Z'
  },
  {
    id: 'mv-bahubali-heritage',
    title: 'Kingdom of Mahishmati: Royal Chronicles',
    altTitle: 'The Crown of Devasena',
    slug: 'kingdom-of-mahishmati-chronicles',
    releaseYear: 2025,
    language: 'Telugu',
    genres: ['Action', 'Drama', 'Adventure'],
    description: 'An authorized cinematic historical epic set in ancient southern India exploring the dynastic conflicts, strategic wars, palace intrigue, and heroism that forged the legendary kingdom of Mahishmati.',
    director: 'S. S. Rajamouli',
    cast: ['Prabhas', 'Rana Daggubati', 'Anushka Shetty', 'Ramya Krishnan', 'Sathyaraj'],
    imdbRating: 8.7,
    runtime: '172 min',
    keywords: ['south indian movies', 'telugu cinema', 'mahishmati', 'action epic download', 'rajamouli film'],
    metaTitle: 'Kingdom of Mahishmati – South Indian Action Epic | CineVault',
    metaDescription: 'Download Kingdom of Mahishmati South Indian historical action cinema in 1080p, 720p, 360p.',
    category: 'South Indian',
    posterUrl: '/src/assets/images/poster_ramayana_epic_1794202759008.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    qualities: [
      {
        id: 'q-bahu-360',
        quality: '360p',
        fileName: 'Mahishmati_Chronicles_360p.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 440401920,
        fileSizeDisplay: '420 MB',
        downloadUrl: '/api/movies/mv-bahubali-heritage/download/360p',
        isAvailable: true
      },
      {
        id: 'q-bahu-720',
        quality: '720p',
        fileName: 'Mahishmati_Chronicles_720p_HD.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 1226833920,
        fileSizeDisplay: '1.14 GB',
        downloadUrl: '/api/movies/mv-bahubali-heritage/download/720p',
        isAvailable: true
      },
      {
        id: 'q-bahu-1080',
        quality: '1080p',
        fileName: 'Mahishmati_Chronicles_1080p_Atmos_FHD.mkv',
        fileFormat: 'MKV',
        fileSizeBytes: 2791728742,
        fileSizeDisplay: '2.60 GB',
        downloadUrl: '/api/movies/mv-bahubali-heritage/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 61200,
    downloads: 25400,
    createdAt: '2026-10-20T16:00:00.000Z',
    updatedAt: '2026-11-05T12:00:00.000Z'
  },
  {
    id: 'mv-living-dead',
    title: 'Night of the Living Dead',
    altTitle: 'Dawn of the Undead (1968)',
    slug: 'night-of-the-living-dead-1968',
    releaseYear: 1968,
    language: 'English',
    genres: ['Horror', 'Mystery', 'Thriller'],
    description: 'George A. Romero’s legendary public domain horror masterpiece. A ragtag group of survivors barricade themselves in a Pennsylvania farmhouse to withstand onslaughts from resurrected ghouls.',
    director: 'George A. Romero',
    cast: ['Duane Jones', 'Judith O\'Dea', 'Karl Hardman', 'Marilyn Eastman'],
    imdbRating: 7.9,
    runtime: '96 min',
    keywords: ['night of the living dead', 'romero horror', 'public domain horror', 'zombie movie download', 'classic horror fhd'],
    metaTitle: 'Night of the Living Dead (1968) – Full HD Download | CineVault',
    metaDescription: 'Free and authorized public-domain download of George Romero’s Night of the Living Dead in 1080p, 720p.',
    category: 'Trending',
    posterUrl: '/src/assets/images/poster_vintage_detective_1794202758894.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    qualities: [
      {
        id: 'q-dead-360',
        quality: '360p',
        fileName: 'Night_of_the_Living_Dead_360p.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 230686720,
        fileSizeDisplay: '220 MB',
        downloadUrl: '/api/movies/mv-living-dead/download/360p',
        isAvailable: true
      },
      {
        id: 'q-dead-720',
        quality: '720p',
        fileName: 'Night_of_the_Living_Dead_720p_Restored.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 713031680,
        fileSizeDisplay: '680 MB',
        downloadUrl: '/api/movies/mv-living-dead/download/720p',
        isAvailable: true
      },
      {
        id: 'q-dead-1080',
        quality: '1080p',
        fileName: 'Night_of_the_Living_Dead_1080p_FHD.mkv',
        fileFormat: 'MKV',
        fileSizeBytes: 1572864000,
        fileSizeDisplay: '1.46 GB',
        downloadUrl: '/api/movies/mv-living-dead/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 41200,
    downloads: 16900,
    createdAt: '2026-09-12T14:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z'
  },
  {
    id: 'mv-chronicles-tokyo-noir',
    title: 'Tokyo Midnight Protocol: Web Series',
    altTitle: 'Shinjuku Circuit – Season 1',
    slug: 'tokyo-midnight-protocol-series',
    releaseYear: 2026,
    language: 'Japanese / English Sub',
    genres: ['Action', 'Crime', 'Sci-Fi'],
    description: 'A 6-episode adrenaline web series detailing how a rogue drone mechanic and an underground cyber-broker join forces against syndicate syndication across neon Shinjuku rooftops.',
    director: 'Kenji Kamiyama',
    cast: ['Hiroshi Abe', 'Rinko Kikuchi', 'Tadanobu Asano', 'Tao Tsuchiya'],
    imdbRating: 8.5,
    runtime: '8 Episodes (45 min each)',
    keywords: ['web series download', 'tokyo cyberpunk series', 'shinjuku circuit', 'japanese action series'],
    metaTitle: 'Tokyo Midnight Protocol – Web Series Season 1 Complete | CineVault',
    metaDescription: 'Download complete Web Series Tokyo Midnight Protocol in 1080p, 720p with English subtitles.',
    category: 'Web Series',
    posterUrl: '/src/assets/images/poster_neon_cyberpunk_1794202759623.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    qualities: [
      {
        id: 'q-tokyo-360',
        quality: '360p',
        fileName: 'Tokyo_Midnight_Protocol_S01_360p_Pack.zip',
        fileFormat: 'ZIP',
        fileSizeBytes: 838860800,
        fileSizeDisplay: '800 MB',
        downloadUrl: '/api/movies/mv-chronicles-tokyo-noir/download/360p',
        isAvailable: true
      },
      {
        id: 'q-tokyo-720',
        quality: '720p',
        fileName: 'Tokyo_Midnight_Protocol_S01_720p_HD_Pack.zip',
        fileFormat: 'ZIP',
        fileSizeBytes: 2411724800,
        fileSizeDisplay: '2.25 GB',
        downloadUrl: '/api/movies/mv-chronicles-tokyo-noir/download/720p',
        isAvailable: true
      },
      {
        id: 'q-tokyo-1080',
        quality: '1080p',
        fileName: 'Tokyo_Midnight_Protocol_S01_1080p_FHD_Pack.zip',
        fileFormat: 'ZIP',
        fileSizeBytes: 5153960755,
        fileSizeDisplay: '4.80 GB',
        downloadUrl: '/api/movies/mv-chronicles-tokyo-noir/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 25900,
    downloads: 9800,
    createdAt: '2026-10-28T09:00:00.000Z',
    updatedAt: '2026-11-06T15:00:00.000Z'
  },
  {
    id: 'mv-metropolis-restored',
    title: 'Metropolis: 2026 Ultra Remaster',
    altTitle: 'Fritz Lang\'s Metropolis (1927)',
    slug: 'metropolis-ultra-remaster',
    releaseYear: 1927,
    language: 'Silent / Orchestral Score',
    genres: ['Sci-Fi', 'Drama'],
    description: 'Fritz Lang\'s seminal 1927 science-fiction monumental epic. In a futuristic dystopian city sharply divided between the working class and the city planners, the son of the city\'s mastermind falls in love with a prophet of the workers.',
    director: 'Fritz Lang',
    cast: ['Brigitte Helm', 'Alfred Abel', 'Gustav Fröhlich', 'Rudolf Klein-Rogge'],
    imdbRating: 8.3,
    runtime: '153 min',
    keywords: ['metropolis', 'fritz lang', 'classic sci-fi', 'silent film download', 'public domain movie'],
    metaTitle: 'Metropolis (1927) Restored – 1080p FHD Movie Download | CineVault',
    metaDescription: 'Download Fritz Lang’s masterpiece Metropolis with complete orchestral soundtrack in 1080p and 720p.',
    category: 'Latest',
    posterUrl: '/src/assets/images/poster_vintage_detective_1794202758894.jpg',
    backdropUrl: '/src/assets/images/hero_cinematic_epic_1794202756913.jpg',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    qualities: [
      {
        id: 'q-met-360',
        quality: '360p',
        fileName: 'Metropolis_1927_360p.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 272629760,
        fileSizeDisplay: '260 MB',
        downloadUrl: '/api/movies/mv-metropolis-restored/download/360p',
        isAvailable: true
      },
      {
        id: 'q-met-720',
        quality: '720p',
        fileName: 'Metropolis_1927_720p_HD.mp4',
        fileFormat: 'MP4',
        fileSizeBytes: 817889280,
        fileSizeDisplay: '780 MB',
        downloadUrl: '/api/movies/mv-metropolis-restored/download/720p',
        isAvailable: true
      },
      {
        id: 'q-met-1080',
        quality: '1080p',
        fileName: 'Metropolis_1927_1080p_Orchestral_FHD.mkv',
        fileFormat: 'MKV',
        fileSizeBytes: 1887436800,
        fileSizeDisplay: '1.76 GB',
        downloadUrl: '/api/movies/mv-metropolis-restored/download/1080p',
        isAvailable: true
      }
    ],
    status: 'published',
    views: 18200,
    downloads: 7100,
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-11-03T18:00:00.000Z'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Error reading database file, resetting to seeds:', e);
    }

    const initialDb: DatabaseSchema = {
      movies: SEED_MOVIES,
      ads: DEFAULT_ADS,
      settings: DEFAULT_SETTINGS,
      users: [
        {
          id: 'usr-1',
          name: 'Demo Moviegoer',
          email: 'user@cinevault.org',
          role: 'user',
          favorites: ['mv-ramayana', 'mv-neon-rain'],
          downloadHistory: [
            {
              movieId: 'mv-ramayana',
              movieTitle: 'Ramayana: The Legend Begins',
              quality: '1080p',
              downloadedAt: '2026-11-06T18:20:00.000Z',
              fileSizeDisplay: '2.3 GB'
            }
          ],
          createdAt: '2026-10-01T10:00:00.000Z'
        }
      ],
      admins: [
        {
          id: 'admin-1',
          name: 'CineVault Super Administrator',
          email: 'admin@cinevault.org',
          passwordHash: 'admin12345', // In production, use bcrypt; here plain/hashed for verification
        }
      ],
      categories: DEFAULT_CATEGORIES,
      genres: DEFAULT_GENRES
    };

    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed writing db.json:', err);
    }
  }

  private save(): void {
    this.saveData(this.data);
  }

  // Movies
  public getMovies(filters?: {
    search?: string;
    category?: string;
    genre?: string;
    year?: number;
    language?: string;
    quality?: string;
    status?: string;
  }): Movie[] {
    let list = this.data.movies;

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((m) => m.status === filters.status);
    } else if (!filters?.status) {
      // Default to published only for public queries
      list = list.filter((m) => m.status === 'published');
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.altTitle && m.altTitle.toLowerCase().includes(q)) ||
          m.director.toLowerCase().includes(q) ||
          m.cast.some((c) => c.toLowerCase().includes(q)) ||
          m.keywords.some((k) => k.toLowerCase().includes(q)) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.language.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'All') {
      list = list.filter((m) => m.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.genre && filters.genre !== 'All') {
      list = list.filter((m) => m.genres.some((g) => g.toLowerCase() === filters.genre!.toLowerCase()));
    }

    if (filters?.year && !isNaN(filters.year)) {
      list = list.filter((m) => m.releaseYear === filters.year);
    }

    if (filters?.language && filters.language !== 'All') {
      list = list.filter((m) => m.language.toLowerCase() === filters.language!.toLowerCase());
    }

    if (filters?.quality && filters.quality !== 'All') {
      list = list.filter((m) => m.qualities.some((q) => q.quality === filters.quality && q.isAvailable));
    }

    return list;
  }

  public getMovieByIdOrSlug(idOrSlug: string): Movie | undefined {
    return this.data.movies.find(
      (m) => m.id === idOrSlug || m.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
  }

  public incrementMovieViews(id: string): Movie | undefined {
    const movie = this.data.movies.find((m) => m.id === id || m.slug === id);
    if (movie) {
      movie.views = (movie.views || 0) + 1;
      this.save();
    }
    return movie;
  }

  public incrementMovieDownloads(id: string): Movie | undefined {
    const movie = this.data.movies.find((m) => m.id === id || m.slug === id);
    if (movie) {
      movie.downloads = (movie.downloads || 0) + 1;
      this.save();
    }
    return movie;
  }

  public createMovie(movieData: Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'downloads'>): Movie {
    const newMovie: Movie = {
      ...movieData,
      id: `mv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      views: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.movies.unshift(newMovie);
    this.save();
    return newMovie;
  }

  public updateMovie(id: string, updates: Partial<Movie>): Movie | null {
    const index = this.data.movies.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.data.movies[index] = {
      ...this.data.movies[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.movies[index];
  }

  public deleteMovie(id: string): boolean {
    const prevLen = this.data.movies.length;
    this.data.movies = this.data.movies.filter((m) => m.id !== id);
    if (this.data.movies.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Ads
  public getAds(): AdConfiguration[] {
    return this.data.ads;
  }

  public updateAd(id: string, updates: Partial<AdConfiguration>): AdConfiguration | null {
    const ad = this.data.ads.find((a) => a.id === id);
    if (!ad) return null;
    Object.assign(ad, updates);
    this.save();
    return ad;
  }

  public trackAdImpression(id: string): void {
    const ad = this.data.ads.find((a) => a.id === id);
    if (ad) {
      ad.impressionsCount = (ad.impressionsCount || 0) + 1;
      this.save();
    }
  }

  public trackAdClick(id: string): void {
    const ad = this.data.ads.find((a) => a.id === id);
    if (ad) {
      ad.clicksCount = (ad.clicksCount || 0) + 1;
      this.save();
    }
  }

  // Settings
  public getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    Object.assign(this.data.settings, updates);
    this.save();
    return this.data.settings;
  }

  // Stats
  public getStats(): AdminStats {
    let totalStorageUsedBytes = 0;
    let totalViews = 0;
    let totalDownloads = 0;

    for (const movie of this.data.movies) {
      totalViews += movie.views || 0;
      totalDownloads += movie.downloads || 0;
      for (const q of movie.qualities) {
        if (q.isAvailable && q.fileSizeBytes) {
          totalStorageUsedBytes += q.fileSizeBytes;
        }
      }
    }

    const gb = (totalStorageUsedBytes / (1024 * 1024 * 1024)).toFixed(2);

    return {
      totalMovies: this.data.movies.length,
      totalViews,
      totalDownloads,
      totalCategories: this.data.categories.length,
      totalStorageUsedBytes,
      totalStorageUsedDisplay: `${gb} GB`,
      totalUsers: this.data.users.length,
      publishedMoviesCount: this.data.movies.filter((m) => m.status === 'published').length,
      draftsCount: this.data.movies.filter((m) => m.status === 'draft').length
    };
  }

  // Admin Auth
  public verifyAdmin(email: string, password: string): { id: string; email: string; name: string } | null {
    const admin = this.data.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (admin && admin.passwordHash === password) {
      return { id: admin.id, email: admin.email, name: admin.name };
    }
    return null;
  }

  // Categories & Genres
  public getCategories(): string[] {
    return this.data.categories;
  }

  public getGenres(): string[] {
    return this.data.genres;
  }

  // User Management
  public getUser(email: string): UserAccount | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(name: string, email: string): UserAccount {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'user',
      favorites: [],
      downloadHistory: [],
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public toggleFavorite(userId: string, movieId: string): string[] {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return [];
    if (user.favorites.includes(movieId)) {
      user.favorites = user.favorites.filter((id) => id !== movieId);
    } else {
      user.favorites.push(movieId);
    }
    this.save();
    return user.favorites;
  }

  public addDownloadHistory(userId: string, movieId: string, quality: '360p' | '720p' | '1080p'): void {
    const user = this.data.users.find((u) => u.id === userId);
    const movie = this.data.movies.find((m) => m.id === movieId);
    if (!user || !movie) return;

    const q = movie.qualities.find((item) => item.quality === quality);
    user.downloadHistory.unshift({
      movieId,
      movieTitle: movie.title,
      quality,
      downloadedAt: new Date().toISOString(),
      fileSizeDisplay: q?.fileSizeDisplay || 'Unknown'
    });
    if (user.downloadHistory.length > 50) {
      user.downloadHistory.pop();
    }
    this.save();
  }
}

export const db = new Database();
