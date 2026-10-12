import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, User, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ordersApi } from '@client/src/api';
import type { Product } from '@shared/api.interface';

interface OrderDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDialog({ product, open, onOpenChange }: OrderDialogProps) {
  const navigate = useNavigate();
  const [contact, setContact] = useState('');
  const [gameServer, setGameServer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!contact.trim()) {
      toast.error('请填写联系方式');
      return;
    }
    setSubmitting(true);
    try {
      const order = await ordersApi.create({
        productId: product.id,
        productName: product.name,
        productPrice: Number(product.price),
        amount: Number(product.price),
        contact: contact.trim(),
        gameServer: gameServer.trim(),
      });
      toast.success('下单成功');
      onOpenChange(false);
      navigate(`/payment/${order.orderNo}`);
    } catch (err) {
      toast.error('下单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl glass-card border-b-0 border-x-0 max-h-[85vh] overflow-y-auto"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">确认下单</h3>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="glass-card p-3">
                <div className="font-semibold text-white text-sm">{product.name}</div>
                <div className="text-purple-400 font-bold text-lg mt-1">¥{product.price}</div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  联系方式 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="请输入手机号/微信号/QQ号"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">客服将通过此方式联系您</p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">游戏区服</label>
                <div className="relative">
                  <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={gameServer}
                    onChange={e => setGameServer(e.target.value)}
                    placeholder="如：安卓QQ区 / 微信IOS服"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <div className="text-xs text-slate-400">应付金额</div>
                  <div className="text-2xl font-bold text-purple-400">¥{product.price}</div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-esports px-8 py-3 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '立即下单'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
