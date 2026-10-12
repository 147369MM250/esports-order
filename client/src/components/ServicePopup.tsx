import { motion, AnimatePresence } from 'framer-motion';
import { X, Headphones, Phone, MessageCircle } from 'lucide-react';
import { useAppSettings } from '@client/src/contexts/AppContext';
import { Image } from '@client/src/components/ui/image';

interface ServicePopupProps {
  open: boolean;
  onClose: () => void;
}

export default function ServicePopup({ open, onClose }: ServicePopupProps) {
  const { settings } = useAppSettings();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl glass-card border-b-0 border-x-0 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">联系客服</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {settings?.serviceQrUrl ? (
              <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 mb-4">
                <Image src={settings.serviceQrUrl} alt="客服二维码" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-slate-800/50 rounded-xl flex items-center justify-center mb-4">
                <p className="text-slate-500 text-xs text-center px-4">
                  请在后台设置客服二维码
                </p>
              </div>
            )}

            <p className="text-center text-sm text-slate-400 mb-4">
              扫码添加客服微信，获取专业服务
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="btn-outline py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                在线咨询
              </button>
              <button
                onClick={onClose}
                className="btn-esports py-3 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                电话联系
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
