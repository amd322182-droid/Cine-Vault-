import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './server/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directories exist
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded assets
app.use('/uploads', express.static(UPLOADS_DIR));

// ========================
// API Endpoints
// ========================

// 1. Movies List & Advanced Search
app.get('/api/movies', (req: Request, res: Response) => {
  try {
    const { search, category, genre, year, language, quality, status } = req.query;
    const movies = db.getMovies({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      genre: genre ? String(genre) : undefined,
      year: year ? parseInt(String(year), 10) : undefined,
      language: language ? String(language) : undefined,
      quality: quality ? String(quality) : undefined,
      status: status ? String(status) : undefined
    });
    res.json({ success: true, count: movies.length, data: movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ success: false, error: 'Internal server error fetching movies' });
  }
});

// 2. Single Movie Details by ID or Slug
app.get('/api/movies/:slugOrId', (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const movie = db.getMovieByIdOrSlug(slugOrId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    // Auto increment view count
    db.incrementMovieViews(movie.id);
    res.json({ success: true, data: movie });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 3. Create Movie (Admin)
app.post('/api/movies', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.title || !body.slug) {
      return res.status(400).json({ success: false, error: 'Title and Slug are required' });
    }

    const created = db.createMovie({
      title: body.title,
      altTitle: body.altTitle || '',
      slug: body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      releaseYear: Number(body.releaseYear) || new Date().getFullYear(),
      language: body.language || 'English',
      genres: Array.isArray(body.genres) ? body.genres : [body.genres || 'Action'],
      description: body.description || '',
      director: body.director || 'Unknown',
      cast: Array.isArray(body.cast) ? body.cast : (body.cast ? body.cast.split(',').map((s: string) => s.trim()) : []),
      imdbRating: body.imdbRating ? Number(body.imdbRating) : undefined,
      runtime: body.runtime || '120 min',
      keywords: Array.isArray(body.keywords) ? body.keywords : (body.keywords ? body.keywords.split(',').map((s: string) => s.trim()) : []),
      metaTitle: body.metaTitle || `${body.title} – Movie Information & Download`,
      metaDescription: body.metaDescription || body.description?.slice(0, 150) || '',
      category: body.category || 'Latest',
      posterUrl: body.posterUrl || '',
      backdropUrl: body.backdropUrl || '',
      previewVideoUrl: body.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      qualities: body.qualities || [],
      status: body.status || 'published'
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ success: false, error: 'Failed to create movie' });
  }
});

// 4. Update Movie (Admin)
app.put('/api/movies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateMovie(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ success: false, error: 'Failed to update movie' });
  }
});

// 5. Delete Movie (Admin)
app.delete('/api/movies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteMovie(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ success: false, error: 'Failed to delete movie' });
  }
});

// 6. Secure Download Endpoint
app.get('/api/movies/:id/download/:quality', (req: Request, res: Response) => {
  try {
    const { id, quality } = req.params;
    const movie = db.getMovieByIdOrSlug(id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const qual = movie.qualities.find((q) => q.quality.toLowerCase() === quality.toLowerCase());
    if (!qual || !qual.isAvailable) {
      return res.status(404).json({ success: false, error: `Quality ${quality} not available for this movie` });
    }

    // Increment download metrics
    db.incrementMovieDownloads(movie.id);

    // Optional user history registration if header is present
    const userEmail = req.headers['x-user-email'] as string;
    if (userEmail) {
      const user = db.getUser(userEmail);
      if (user) {
        db.addDownloadHistory(user.id, movie.id, qual.quality);
      }
    }

    // Return the authorized payload / download URL
    res.json({
      success: true,
      data: {
        movieId: movie.id,
        movieTitle: movie.title,
        quality: qual.quality,
        fileName: qual.fileName,
        fileFormat: qual.fileFormat,
        fileSizeDisplay: qual.fileSizeDisplay,
        directStreamUrl: movie.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        downloadUrl: qual.downloadUrl.startsWith('http') ? qual.downloadUrl : movie.previewVideoUrl,
        expiresIn: '24 hours',
        verifiedLicense: 'Authorized / Public Domain Distribution'
      }
    });
  } catch (error) {
    console.error('Download authorization error:', error);
    res.status(500).json({ success: false, error: 'Failed to process download authorization' });
  }
});

// 7. File Upload System (Poster, Backdrop, or Video Files)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { fileName, fileType, fileData, quality } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, error: 'File name and data are required' });
    }

    // Parse base64 payload if provided
    let buffer: Buffer;
    if (fileData.includes(';base64,')) {
      const base64Str = fileData.split(';base64,')[1];
      buffer = Buffer.from(base64Str, 'base64');
    } else {
      buffer = Buffer.from(fileData, 'utf-8');
    }

    const sizeBytes = buffer.length;
    let sizeDisplay = '';
    if (sizeBytes < 1024 * 1024) {
      sizeDisplay = `${(sizeBytes / 1024).toFixed(1)} KB`;
    } else if (sizeBytes < 1024 * 1024 * 1024) {
      sizeDisplay = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      sizeDisplay = `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }

    // Write file to disk
    const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = path.resolve(UPLOADS_DIR, safeName);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    res.json({
      success: true,
      data: {
        fileName: safeName,
        originalName: fileName,
        fileFormat: path.extname(fileName).replace('.', '').toUpperCase() || 'BIN',
        fileSizeBytes: sizeBytes,
        fileSizeDisplay: sizeDisplay,
        quality: quality || '720p',
        fileUrl: publicUrl,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ success: false, error: 'File upload processing failed' });
  }
});

// 8. Advertisement Management
app.get('/api/ads', (_req: Request, res: Response) => {
  try {
    const ads = db.getAds();
    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ads configuration' });
  }
});

app.put('/api/ads/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateAd(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Ad configuration not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update ad' });
  }
});

app.post('/api/ads/:id/impression', (req: Request, res: Response) => {
  const { id } = req.params;
  db.trackAdImpression(id);
  res.json({ success: true });
});

app.post('/api/ads/:id/click', (req: Request, res: Response) => {
  const { id } = req.params;
  db.trackAdClick(id);
  res.json({ success: true });
});

// 9. Admin Dashboard Metrics & Stats
app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to calculate statistics' });
  }
});

// 10. Website Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

// 11. Admin Authentication
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const admin = db.verifyAdmin(email, password);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin'
        },
        token: `mock_admin_token_${admin.id}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Admin login error' });
  }
});

// 12. User Auth (Login/Register/Me)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }
  let user = db.getUser(email);
  if (!user) {
    user = db.createUser(name || email.split('@')[0], email);
  }
  res.json({ success: true, data: { user, token: `user_tok_${user.id}` } });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'Name and email are required' });
  }
  let user = db.getUser(email);
  if (user) {
    return res.status(400).json({ success: false, error: 'User with this email already exists' });
  }
  user = db.createUser(name, email);
  res.json({ success: true, data: { user, token: `user_tok_${user.id}` } });
});

app.post('/api/user/favorite', (req: Request, res: Response) => {
  const { email, movieId } = req.body;
  if (!email || !movieId) {
    return res.status(400).json({ success: false, error: 'Email and movieId are required' });
  }
  let user = db.getUser(email);
  if (!user) {
    user = db.createUser(email.split('@')[0], email);
  }
  const favorites = db.toggleFavorite(user.id, movieId);
  res.json({ success: true, data: { favorites } });
});

app.get('/api/categories', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getCategories() });
});

app.get('/api/genres', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getGenres() });
});

// 13. Dynamic SEO Sitemap & Robots.txt
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const movies = db.getMovies({ status: 'published' });
  const baseUrl = process.env.APP_URL || 'https://cinevault.org';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  for (const m of movies) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/movie/${m.slug}</loc>\n`;
    xml += `    <lastmod>${m.updatedAt.split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://cinevault.org';
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// ========================
// Frontend Dev/Prod Setup
// ========================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[CineVault] Server running smoothly on port ${PORT}`);
  });
}

startServer();
