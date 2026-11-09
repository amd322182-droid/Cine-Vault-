import React, { useState } from 'react';
import { X, Download, ShieldCheck, CheckCircle2, HardDrive, FileVideo } from 'lucide-react';
import { Movie, VideoQualityLevel, AdConfiguration } from '../types/index.js';
import { AdSlot } from './AdSlot.js';

interface DownloadModalProps {
  movie: Movie | null;
  selectedQuality: VideoQualityLevel;
  isOpen: boolean;
  onClose: () => void;
  ads: AdConfiguration[];
  userEmail?: string;
  onDownloadCompleted?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  movie,
  selectedQuality,
  isOpen,
  onClose,
  ads,
  userEmail,
  onDownloadCompleted
}) => {
  const [downloadState, setDownloadState] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [downloadPayload, setDownloadPayload] = useState<any>(null);

  if (!isOpen || !movie) return null;

  const qualityObj = movie.qualities.find((q) => q.quality === selectedQuality);

  const handleStartDownload = async () => {
    setDownloadState('generating');
    try {
      const response = await fetch(`/api/movies/${movie.id}/download/${selectedQuality}`, {
        headers: userEmail ? { 'x-user-email': userEmail } : {}
      });
      const data = await response.json();
      if (data.success) {
        setDownloadPayload(data.data);
        setDownloadState('ready');
        if (onDownloadCompleted) onDownloadCompleted();

        // Trigger real file download or direct stream download
        const a = document.createElement('a');
        a.href = data.data.directStreamUrl || data.data.downloadUrl;
        a.download = data.data.fileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setDownloadState('idle');
      }
    } catch (err) {
      console.error('Download error:', err);
      setDownloadState('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e1320] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#121828] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white font-['Outfit']">Download Movie</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <img
              src={movie.posterUrl || '/src/assets/images/poster_vintage_detective_1794202758894.jpg'}
              alt={movie.title}
              className="w-20 h-28 object-cover rounded-lg shadow-md border border-slate-800 shrink-0"
            />
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base leading-tight font-['Outfit']">
                {movie.title}
              </h4>
              <p className="text-xs text-slate-400">
                {movie.releaseYear} · {movie.language} · {movie.genres.slice(0, 2).join(', ')}
              </p>

              {/* Quality Specifications Card */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <FileVideo className="w-3.5 h-3.5 text-rose-400" /> Selected Quality:
                  </span>
                  <span className="font-bold text-white uppercase">{selectedQuality}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-blue-400" /> File Size:
                  </span>
                  <span className="font-semibold text-rose-400">{qualityObj?.fileSizeDisplay || '850 MB'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Container Format:</span>
                  <span className="font-mono text-slate-200">{qualityObj?.fileFormat || 'MP4'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorized Release · Direct High-Speed CDN Endpoint Verified</span>
          </div>

          {/* Download Action Button */}
          {downloadState === 'idle' && (
            <button
              onClick={handleStartDownload}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 hover:scale-101 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Confirm & Download ({qualityObj?.fileSizeDisplay || 'File'})</span>
            </button>
          )}

          {downloadState === 'generating' && (
            <div className="py-4 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">
                Allocating high-speed streaming channel & verifying file integrity...
              </p>
            </div>
          )}

          {downloadState === 'ready' && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Download Started Successfully!</span>
              </div>
              <p className="text-xs text-slate-300">
                Your browser should automatically begin downloading <span className="font-mono text-white">{downloadPayload?.fileName}</span>.
              </p>
              <a
                href={downloadPayload?.directStreamUrl}
                download={downloadPayload?.fileName}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-semibold text-rose-400 hover:underline"
              >
                Click here if download didn't start automatically →
              </a>
            </div>
          )}

          {/* Advertisement slot inside download area */}
          <div className="pt-2 border-t border-slate-800/80">
            <AdSlot placement="download_page" type="banner_300x250" ads={ads} />
          </div>
        </div>
      </div>
    </div>
  );
};
