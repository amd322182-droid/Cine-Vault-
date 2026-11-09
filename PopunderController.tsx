import { useEffect } from 'react';
import { AdConfiguration } from '../types/index.js';

interface PopunderControllerProps {
  ads: AdConfiguration[];
}

export const PopunderController: React.FC<PopunderControllerProps> = ({ ads }) => {
  useEffect(() => {
    // 1. Check Popunder
    const popunder = ads.find((a) => a.type === 'popunder' && a.enabled && a.scriptUrl);
    if (popunder && popunder.scriptUrl) {
      const existing = document.querySelector(`script[src="${popunder.scriptUrl}"]`);
      if (!existing) {
        const script = document.createElement('script');
        script.src = popunder.scriptUrl;
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // 2. Check Social Bar
    const socialBar = ads.find((a) => a.type === 'social_bar' && a.enabled && a.scriptUrl);
    if (socialBar && socialBar.scriptUrl) {
      const existing = document.querySelector(`script[src="${socialBar.scriptUrl}"]`);
      if (!existing) {
        const script = document.createElement('script');
        script.src = socialBar.scriptUrl;
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [ads]);

  return null;
};
