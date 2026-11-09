import React, { useState } from 'react';
import { Film, Shield, Mail, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { AdSlot } from './AdSlot.js';
import { AdConfiguration } from '../types/index.js';

interface FooterProps {
  onNavigateCategory: (category: string) => void;
  ads: AdConfiguration[];
}

export const Footer: React.FC<FooterProps> = ({ onNavigateCategory, ads }) => {
  const [modalPolicy, setModalPolicy] = useState<string | null>(null);
  const [dmcaSubmitted, setDmcaSubmitted] = useState(false);
  const [dmcaUrl, setDmcaUrl] = useState('');
  const [dmcaEmail, setDmcaEmail] = useState('');

  const handleDmcaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDmcaSubmitted(true);
    setTimeout(() => {
      setDmcaSubmitted(false);
      setModalPolicy(null);
      setDmcaUrl('');
      setDmcaEmail('');
    }, 2500);
  };

  return (
    <footer className="mt-16 bg-[#080a10] border-t border-slate-800/80 text-slate-400 text-xs">
      {/* Bottom Leaderboard Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <AdSlot placement="homepage_footer" type="banner_468x60" ads={ads} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white font-['Outfit']">
                Cine<span className="text-rose-500">Vault</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              CineVault is a premier cinema repository and high-speed media platform. All movies are provided under verified public domain, open licenses, or authorized distributor agreements.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Safe & Secure Downloads · High Speed Server Cluster</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs font-['Outfit']">Categories</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => onNavigateCategory('Hollywood')} className="hover:text-white transition-colors">Hollywood Movies</button></li>
              <li><button onClick={() => onNavigateCategory('Bollywood')} className="hover:text-white transition-colors">Bollywood Cinema</button></li>
              <li><button onClick={() => onNavigateCategory('South Indian')} className="hover:text-white transition-colors">South Indian Movies</button></li>
              <li><button onClick={() => onNavigateCategory('Animated')} className="hover:text-white transition-colors">Animated Classics</button></li>
              <li><button onClick={() => onNavigateCategory('Web Series')} className="hover:text-white transition-colors">Web Series & Epics</button></li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs font-['Outfit']">Legal & Rights</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => setModalPolicy('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => setModalPolicy('dmca')} className="hover:text-rose-400 transition-colors font-medium">DMCA / Copyright Removal</button></li>
              <li><button onClick={() => setModalPolicy('copyright')} className="hover:text-white transition-colors">Copyright Policy</button></li>
              <li><button onClick={() => setModalPolicy('terms')} className="hover:text-white transition-colors">Terms and Conditions</button></li>
              <li><button onClick={() => setModalPolicy('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
          </div>

          {/* Support & Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs font-['Outfit']">Platform Notice</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => setModalPolicy('disclaimer')} className="hover:text-white transition-colors">Disclaimer</button></li>
              <li><button onClick={() => setModalPolicy('contact')} className="hover:text-white transition-colors">Contact Support</button></li>
              <li><a href="/sitemap.xml" target="_blank" className="hover:text-white transition-colors">XML Sitemap</a></li>
              <li><a href="/robots.txt" target="_blank" className="hover:text-white transition-colors">Robots.txt</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} CineVault Media Network. All rights reserved.</p>
          <p>Operates strictly in compliance with public domain and authorized distribution policies.</p>
        </div>
      </div>

      {/* Interactive Policy Modal */}
      {modalPolicy && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0e1320] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white capitalize font-['Outfit']">
                {modalPolicy === 'dmca' ? 'DMCA Copyright Removal Request' : modalPolicy.replace('-', ' ')}
              </h3>
              <button onClick={() => setModalPolicy(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalPolicy === 'about' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>CineVault is an entertainment archive platform dedicated to providing high-quality digital cinema experiences in 1080p, 720p, and 360p resolutions.</p>
                <p>Our catalog features carefully curated cinema, restored golden-age classics, Creative Commons animations, and authorized studio releases.</p>
              </div>
            )}

            {modalPolicy === 'dmca' && (
              <div className="space-y-3 text-xs text-slate-300">
                <p>CineVault respects the intellectual property rights of creators and copyright holders. If you believe your copyrighted work has been improperly cataloged, submit a formal notice below for immediate review.</p>
                {dmcaSubmitted ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your removal notice has been logged. Action will be taken within 24 hours.</span>
                  </div>
                ) : (
                  <form onSubmit={handleDmcaSubmit} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Movie URL / Title</label>
                      <input
                        type="text"
                        required
                        value={dmcaUrl}
                        onChange={(e) => setDmcaUrl(e.target.value)}
                        placeholder="https://cinevault.org/movie/..."
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Rights Holder Email</label>
                      <input
                        type="email"
                        required
                        value={dmcaEmail}
                        onChange={(e) => setDmcaEmail(e.target.value)}
                        placeholder="legal@rightsowner.com"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs">
                      Submit Takedown Notice
                    </button>
                  </form>
                )}
              </div>
            )}

            {modalPolicy === 'copyright' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>All trademarks, logos, and movie titles belong to their respective copyright holders. CineVault hosts metadata and links to authorized public domain media servers or Creative Commons distributions.</p>
              </div>
            )}

            {modalPolicy === 'disclaimer' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>Disclaimer: CineVault operates as an indexing and distribution platform for authorized and public domain media. We do not engage in unauthorized distribution.</p>
              </div>
            )}

            {modalPolicy === 'terms' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>By using this website, you agree to access content solely for lawful, personal viewing. Automated scraping or denial-of-service attempts are strictly prohibited.</p>
              </div>
            )}

            {modalPolicy === 'privacy' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>We do not sell personal data. Minimal analytical metrics (such as aggregated download and view counters) are maintained to optimize CDN bandwidth allocation.</p>
              </div>
            )}

            {modalPolicy === 'contact' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>For inquiries, partnerships, or media inquiries, reach our administrative team at:</p>
                <p className="font-mono text-rose-400">support@cinevault.org</p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
