import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Package, Tag, Settings, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAppSettings } from '@client/src/contexts/AppContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, loading } = useAppSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('admin_logged_in');
    if (!loggedIn && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setMenuOpen(false);
    navigate('/', { replace: true });
  };

  const navItems = [
    { path: '/admin/orders', icon: ClipboardList, label: '订单管理' },
    { path: '/admin/products', icon: Package, label: '商品管理' },
    { path: '/admin/categories', icon: Tag, label: '分类管理' },
    { path: '/admin/settings', icon: Settings, label: '系统设置' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="esports-bg" />

      <header className="sticky top-0 z-30 glass-card border-b-0 rounded-none border-x-0 border-t-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">管理后台</div>
              <div className="text-xs text-slate-400">{settings?.siteName}</div>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-lg bg-white/5 border border-purple-500/30 flex items-center justify-center text-slate-300"
            aria-label="菜单"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sticky top-14 z-20 glass-card border-t-0 rounded-none border-x-0 overflow-hidden"
          >
            <nav className="p-2 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white'
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

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
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                  isActive ? 'text-purple-400' : 'text-slate-500'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
