import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, ClipboardList, Headphones, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSettings } from '@client/src/contexts/AppContext';
import WelcomePopup from './WelcomePopup';
import ServicePopup from './ServicePopup';
import MusicPlayer from './MusicPlayer';
import { Image } from '@client/src/components/ui/image';

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, loading } = useAppSettings();
  const [showService, setShowService] = useState(false);

  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/products', icon: ShoppingBag, label: '商品' },
    { path: '/orders', icon: ClipboardList, label: '订单' },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="esports-bg" />

      <header className="sticky top-0 z-30 glass-card border-b-0 rounded-none border-x-0 border-t-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center overflow-hidden">
              {settings?.avatarUrl ? (
                <Image src={settings.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{settings?.siteName || '电竞点单'}</div>
              <div className="text-xs text-slate-400">{settings?.siteSubtitle || '专业代练·极速上分'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowService(true)}
              className="w-10 h-10 rounded-full bg-white/5 border border-purple-500/30 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
              aria-label="客服"
            >
              <Headphones className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-10 h-10 rounded-full bg-white/5 border border-purple-500/30 flex items-center justify-center text-slate-400 hover:text-purple-300 transition-colors"
              aria-label="管理后台"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="px-4 py-4"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-30 glass-card border-t border-b-0 border-x-0 rounded-none">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                  isActive ? 'text-purple-400' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <WelcomePopup />
      <ServicePopup open={showService} onClose={() => setShowService(false)} />
      <MusicPlayer />
    </div>
  );
}
