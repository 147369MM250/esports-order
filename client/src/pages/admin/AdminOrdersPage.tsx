import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, XCircle, Play, CheckCircle, Phone, Gamepad2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi } from '@client/src/api';
import type { Order, OrderStatus } from '@shared/api.interface';

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'text-yellow-400 bg-yellow-500/10' },
  confirm: { label: '待确认', color: 'text-blue-400 bg-blue-500/10' },
  playing: { label: '代打中', color: 'text-purple-400 bg-purple-500/10' },
  done: { label: '已完成', color: 'text-green-400 bg-green-500/10' },
  reject: { label: '已拒绝', color: 'text-red-400 bg-red-500/10' },
};

const TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'confirm', label: '待确认' },
  { key: 'playing', label: '代打中' },
  { key: 'done', label: '已完成' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = activeTab === 'all' ? {} : { status: activeTab };
      const data = await ordersApi.list({ ...params, pageSize: 100 });
      setOrders(data.items);
    } catch (err) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleConfirm = async (id: string) => {
    try {
      await ordersApi.updateStatus(id, { status: 'confirm' });
      toast.success('已确认接单');
      fetchOrders();
    } catch (err) {
      toast.error('操作失败');
    }
  };

  const handleStartPlaying = async (id: string) => {
    try {
      await ordersApi.updateStatus(id, { status: 'playing' });
      toast.success('已开始代打');
      fetchOrders();
    } catch (err) {
      toast.error('操作失败');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await ordersApi.updateStatus(id, { status: 'done' });
      toast.success('订单已完成');
      fetchOrders();
    } catch (err) {
      toast.error('操作失败');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('请填写拒绝原因');
      return;
    }
    try {
      await ordersApi.updateStatus(id, { status: 'reject', rejectReason: rejectReason.trim() });
      toast.success('已拒绝订单');
      setShowRejectDialog(null);
      setRejectReason('');
      fetchOrders();
    } catch (err) {
      toast.error('操作失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">订单管理</h1>
        <button
          onClick={fetchOrders}
          className="w-9 h-9 rounded-lg bg-white/5 border border-purple-500/30 flex items-center justify-center text-slate-300 hover:text-purple-400 transition-colors"
          aria-label="刷新"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-slate-400 border border-purple-500/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 glass-card">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无订单</p>
          </div>
        ) : (
          orders.map(order => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-slate-400">{order.orderNo}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[order.status].color}`}>
                  {statusMap[order.status].label}
                </span>
              </div>

              <div className="font-semibold text-white mb-2">{order.productName}</div>

              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>{order.contact}</span>
                </div>
                {order.gameServer && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Gamepad2 className="w-4 h-4" />
                    <span>{order.gameServer}</span>
                  </div>
                )}
                <div className="text-purple-400 font-bold">¥{order.amount}</div>
                <div className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              {order.status === 'reject' && order.rejectReason && (
                <div className="mb-3 p-2 rounded-lg bg-red-500/10 text-red-400 text-xs">
                  拒绝原因：{order.rejectReason}
                </div>
              )}

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleConfirm(order.id)}
                      className="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      确认接单
                    </button>
                    <button
                      onClick={() => setShowRejectDialog(order.id)}
                      className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      拒绝
                    </button>
                  </>
                )}
                {order.status === 'confirm' && (
                  <>
                    <button
                      onClick={() => handleStartPlaying(order.id)}
                      className="flex-1 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      开始代打
                    </button>
                    <button
                      onClick={() => setShowRejectDialog(order.id)}
                      className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      拒绝
                    </button>
                  </>
                )}
                {order.status === 'playing' && (
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    完成订单
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showRejectDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowRejectDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl glass-card border-b-0 border-x-0 p-4"
            >
              <h3 className="text-lg font-bold text-white mb-4">拒绝订单</h3>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="请填写拒绝原因"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectDialog(null)}
                  className="flex-1 py-3 rounded-xl btn-outline"
                >
                  取消
                </button>
                <button
                  onClick={() => handleReject(showRejectDialog)}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium"
                >
                  确认拒绝
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
