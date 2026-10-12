import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useAppSettings } from '@client/src/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

export default function WelcomePopup() {
  const { settings } = useAppSettings();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settings?.welcomePopupEnabled) return;
    const shown = localStorage.getItem('welcome_shown');
    if (!shown) {
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem('welcome_shown', '1');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [settings?.welcomePopupEnabled]);

  if (!settings?.welcomePopupEnabled) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[85%] max-w-sm"
          >
            <div className="glass-card p-6 relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/30 rounded-full blur-3xl" />

              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2 gradient-text">
                  {settings.welcomePopupTitle || '欢迎来到电竞点单'}
                </h2>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  {settings.welcomePopupContent || '专业代练服务，安全可靠，极速完成！'}
                </p>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/products');
                  }}
                  className="btn-esports w-full py-3"
                >
                  {settings.welcomePopupButtonText || '立即体验'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
