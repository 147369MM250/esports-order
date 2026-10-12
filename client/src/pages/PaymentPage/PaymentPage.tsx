import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi } from '@client/src/api';
import { useAppSettings } from '@client/src/contexts/AppContext';
import type { Order } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

export default function PaymentPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(300);
  const [paid, setPaid] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!orderNo) return;
    ordersApi.detail(orderNo)
      .then(data => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNo]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaid = () => {
    setPaid(true);
  };

  const copyOrderNo = () => {
    if (order?.orderNo) {
      navigator.clipboard.writeText(order.orderNo);
      toast.success('订单号已复制');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>订单不存在</p>
        <button onClick={() => navigate('/products')} className="btn-outline mt-4">
          返回商品列表
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        aria-label="返回"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">返回</span>
      </button>

      <div className="glass-card p-5 text-center">
        <h2 className="text-lg font-bold text-white mb-1">支付订单</h2>
        <div className="text-4xl font-bold glow-text my-4">¥{order.amount}</div>
        <div className="text-sm text-slate-400">
          订单号：
          <span className="text-slate-300">{order.orderNo}</span>
          <button onClick={copyOrderNo} className="ml-2 text-purple-400" aria-label="复制订单号">
            <Copy className="w-3 h-3 inline" />
          </button>
        </div>
      </div>

      {!paid ? (
        <>
          <div className="glass-card p-5">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300">请于</span>
              <span className={`text-xl font-bold ${countdown <= 60 ? 'text-red-400' : 'text-purple-400'}`}>
                {formatTime(countdown)}
              </span>
              <span className="text-slate-300">内完成支付</span>
            </div>

            <div className="w-56 h-56 mx-auto bg-white rounded-2xl p-3 mb-4">
              {settings?.paymentQrUrl ? (
                <Image
                  src={settings.paymentQrUrl}
                  alt="支付二维码"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm text-center p-4">
                  请在后台设置支付二维码
                </div>
              )}
            </div>

            <p className="text-center text-sm text-slate-400">
              扫码支付后，请点击下方按钮
            </p>
          </div>

          <button onClick={handlePaid} className="btn-esports w-full">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            我已支付
          </button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">支付确认中</h3>
          <p className="text-slate-400 text-sm mb-4">
            请等待确认到账，确认后将为您派单
          </p>
          <p className="text-xs text-slate-500 mb-4">
            可在「我的订单」中输入订单号查询进度
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/orders?orderNo=${order.orderNo}`)}
              className="btn-outline flex-1"
            >
              查看订单
            </button>
            <button
              onClick={() => navigate('/products')}
              className="btn-esports flex-1"
            >
              返回首页
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
