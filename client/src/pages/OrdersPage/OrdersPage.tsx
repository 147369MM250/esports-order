import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, CheckCircle, XCircle, Play, AlertCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi } from '@client/src/api';
import type { Order, OrderStatus } from '@shared/api.interface';

const statusMap: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: '待支付', color: 'text-yellow-400 bg-yellow-500/10', icon: Clock },
  confirm: { label: '待确认', color: 'text-blue-400 bg-blue-500/10', icon: AlertCircle },
  playing: { label: '代打中', color: 'text-purple-400 bg-purple-500/10', icon: Play },
  done: { label: '已完成', color: 'text-green-400 bg-green-500/10', icon: CheckCircle },
  reject: { label: '已拒绝', color: 'text-red-400 bg-red-500/10', icon: XCircle },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirm', 'playing', 'done'];

export default function OrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderNoInput, setOrderNoInput] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderNo = params.get('orderNo');
    if (orderNo) {
      setOrderNoInput(orderNo);
      handleSearch(orderNo);
    } else {
      const saved = localStorage.getItem('my_orders');
      if (saved) {
        try {
          const savedNos = JSON.parse(saved) as string[];
          if (savedNos.length > 0) {
            batchQueryOrders(savedNos);
          }
        } catch {}
      }
    }
  }, [location.search]);

  const batchQueryOrders = async (orderNos: string[]) => {
    if (orderNos.length === 0) {
      setOrders([]);
      return;
    }
    setLoading(true);
    try {
      const data = await ordersApi.batchQuery({ orderNos });
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      toast.error('查询失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (orderNo?: string) => {
    const no = orderNo || orderNoInput.trim();
    if (!no) {
      toast.error('请输入订单号');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const order = await ordersApi.detail(no);
      setOrders([order]);
      const saved = localStorage.getItem('my_orders');
      let savedNos: string[] = [];
      if (saved) {
        try {
          savedNos = JSON.parse(saved);
        } catch {}
      }
      if (!savedNos.includes(no)) {
        savedNos.unshift(no);
        localStorage.setItem('my_orders', JSON.stringify(savedNos.slice(0, 20)));
      }
    } catch (err) {
      setOrders([]);
      toast.error('未找到该订单');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: OrderStatus): number => {
    if (status === 'reject') return -1;
    return STATUS_FLOW.indexOf(status);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">我的订单</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={orderNoInput}
          onChange={e => setOrderNoInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="输入订单号查询，如 DJ..."
          className="w-full pl-10 pr-24 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-esports py-1.5 px-4 text-sm"
        >
          查询
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-slate-400 glass-card">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{searched ? '未找到订单' : '暂无订单记录'}</p>
          <button onClick={() => navigate('/products')} className="btn-esports mt-4 text-sm py-2 px-4">
            去下单
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const s = statusMap[order.status];
            const StatusIcon = s.icon;
            const statusIdx = getStatusIndex(order.status);
            const isRejected = order.status === 'reject';

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono text-xs text-slate-400">{order.orderNo}</div>
                    <div className="font-semibold text-white text-sm mt-0.5">{order.productName}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${s.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {s.label}
                  </span>
                </div>

                <div className="relative pl-4">
                  {isRejected ? (
                    <div className="relative pb-2">
                      <div className="absolute left-[-17px] top-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle className="w-3 h-3 text-red-400" />
                      </div>
                      <div className="text-sm text-red-400 font-medium">订单已拒绝</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {order.rejectReason || '暂无原因'}
                      </div>
                    </div>
                  ) : (
                    STATUS_FLOW.map((flowStatus, idx) => {
                      const completed = idx <= statusIdx;
                      const isCurrent = idx === statusIdx;
                      const FlowIcon = statusMap[flowStatus].icon;
                      return (
                        <div key={flowStatus} className="relative pb-4 last:pb-0">
                          {idx < STATUS_FLOW.length - 1 && (
                            <div
                              className={`absolute left-[7px] top-6 w-0.5 h-full ${
                                idx < statusIdx ? 'bg-purple-500' : 'bg-slate-700'
                              }`}
                            />
                          )}
                          <div
                            className={`absolute left-[-17px] top-0 w-5 h-5 rounded-full flex items-center justify-center z-10 ${
                              completed
                                ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                                : 'bg-slate-700 text-slate-500'
                            }`}
                          >
                            <FlowIcon className="w-3 h-3" />
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              completed ? 'text-white' : 'text-slate-500'
                            } ${isCurrent ? 'text-purple-400' : ''}`}
                          >
                            {statusMap[flowStatus].label}
                            {isCurrent && (
                              <span className="ml-2 text-xs text-purple-400">进行中</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="text-purple-400 font-bold">¥{order.amount}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
