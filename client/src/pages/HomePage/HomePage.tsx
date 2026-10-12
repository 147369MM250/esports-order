import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Trophy, Clock, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { useAppSettings } from '@client/src/contexts/AppContext';
import { productsApi } from '@client/src/api';
import type { Product } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

export default function HomePage() {
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const [hotProducts, setHotProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list({ pageSize: 6 })
      .then(data => setHotProducts(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs mb-4">
            <Sparkles className="w-3 h-3" />
            <span>专业电竞服务</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 gradient-text glow-text">
            {settings?.homeTitle || '荣耀之路 · 即刻启程'}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {settings?.homeSubtitle || '顶尖电竞服务平台，让你的游戏之旅更加精彩'}
          </p>
          
          <button
            onClick={() => navigate('/products')}
            className="btn-esports inline-flex items-center gap-2 px-6 py-3"
          >
            立即下单
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="glass-card p-3 text-center">
          <div className="text-xl font-bold text-white">{settings?.statOrders || '9999'}</div>
          <div className="text-xs text-slate-400 mt-1">累计订单</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{settings?.statGoodRate || '99.8%'}</div>
          <div className="text-xs text-slate-400 mt-1">好评率</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{settings?.statAvgTime || '5分钟'}</div>
          <div className="text-xs text-slate-400 mt-1">平均接单</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="glass-card p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">极速接单</div>
            <div className="text-xs text-slate-400 mt-0.5">5分钟内极速响应</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">大神代练</div>
            <div className="text-xs text-slate-400 mt-0.5">职业选手坐镇</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">安全保障</div>
            <div className="text-xs text-slate-400 mt-0.5">账号安全无忧</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">高效完成</div>
            <div className="text-xs text-slate-400 mt-0.5">按时交付不拖延</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">热门服务</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-purple-400 text-sm flex items-center gap-1"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {hotProducts.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-400 text-sm">
              暂无商品
            </div>
          ) : (
            hotProducts.map(product => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:border-purple-500/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{product.name}</div>
                  <div className="text-xs text-slate-400 truncate mt-0.5 line-clamp-1">{product.description}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-purple-400 font-bold">¥{product.price}</div>
                  <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
