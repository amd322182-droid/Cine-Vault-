import React, { useEffect, useRef } from 'react';
import { AdConfiguration, AdPlacementType } from '../types/index.js';

interface AdSlotProps {
  placement: 'homepage_header' | 'homepage_between_sections' | 'homepage_footer' | 'details_below_info' | 'details_near_downloads' | 'details_sidebar' | 'download_page';
  type?: AdPlacementType;
  ads: AdConfiguration[];
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, type, ads, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active ad matching this placement or specific type
  const targetAd = ads.find((ad) => {
    if (!ad.enabled) return false;
    if (type && ad.type !== type) return false;
    return ad.placements.includes(placement);
  });

  useEffect(() => {
    if (!targetAd || !containerRef.current) return;

    // Track impression silently
    try {
      fetch(`/api/ads/${targetAd.id}/impression`, { method: 'POST' }).catch(() => {});
    } catch (_) {}

    const container = containerRef.current;
    // Clear previous injection
    container.innerHTML = '';

    // Handle Native Banner with container div
    if (targetAd.type === 'native_banner' && targetAd.containerId) {
      const adDiv = document.createElement('div');
      adDiv.id = targetAd.containerId;
      container.appendChild(adDiv);

      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = targetAd.scriptUrl || 'https://bancadeltempoidea.org/21/4ffb108cabdd6aa64223619791f05e54';
      container.appendChild(script);
      return;
    }

    // Handle Iframe atOptions banners (300x250, 468x60, 160x600, 160x300)
    if (targetAd.adKey && targetAd.dimensions) {
      const iframe = document.createElement('iframe');
      iframe.width = `${targetAd.dimensions.width}`;
      iframe.height = `${targetAd.dimensions.height}`;
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.borderRadius = '6px';
      iframe.setAttribute('scrolling', 'no');
      iframe.title = `Advertisement ${targetAd.name}`;

      const scriptSrc =
        targetAd.type === 'banner_300x250'
          ? `https://www.highrevenueformat.com/${targetAd.adKey}/invoke.js`
          : `https://bancadeltempoidea.org/22/${targetAd.adKey}`;

      const docContent = `
        <!DOCTYPE html>
        <html>
        <head><base target="_blank"></head>
        <body style="margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;overflow:hidden;">
          <script type="text/javascript">
            atOptions = {
              'key' : '${targetAd.adKey}',
              'format' : 'iframe',
              'height' : ${targetAd.dimensions.height},
              'width' : ${targetAd.dimensions.width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="${scriptSrc}"></script>
        </body>
        </html>
      `;

      container.appendChild(iframe);
      try {
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(docContent);
          doc.close();
        }
      } catch (err) {
        console.warn('Ad iframe initialization notice:', err);
      }
      return;
    }

    // Handle Popunder or Social bar scripts directly
    if (targetAd.scriptUrl) {
      const script = document.createElement('script');
      script.src = targetAd.scriptUrl;
      script.async = true;
      container.appendChild(script);
    }
  }, [targetAd]);

  if (!targetAd || !targetAd.enabled) {
    return null;
  }

  // Dimension helpers for skeleton / container sizing
  const getContainerDimensions = () => {
    switch (targetAd.type) {
      case 'banner_300x250':
        return 'w-[300px] min-h-[250px]';
      case 'banner_468x60':
        return 'w-full max-w-[468px] min-h-[60px]';
      case 'banner_160x600':
        return 'w-[160px] min-h-[600px]';
      case 'banner_160x300':
        return 'w-[160px] min-h-[300px]';
      case 'native_banner':
        return 'w-full max-w-4xl min-h-[140px]';
      default:
        return 'w-full min-h-[60px]';
    }
  };

  return (
    <div className={`my-4 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
        Sponsored Advertisement
      </span>
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-[#0d121f]/80 border border-slate-800/80 rounded-lg p-1.5 shadow-inner transition-all overflow-hidden ${getContainerDimensions()}`}
      >
        <div className="text-xs text-slate-600 text-center animate-pulse">
          {targetAd.name} ({targetAd.dimensions ? `${targetAd.dimensions.width}x${targetAd.dimensions.height}` : 'Dynamic Responsive Ad'})
        </div>
      </div>
    </div>
  );
};
