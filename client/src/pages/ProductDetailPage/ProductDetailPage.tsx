import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, ShoppingCart, Tag, Shield, Clock } from 'lucide-react';
import { productsApi } from '@client/src/api';
import type { Product } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';
import OrderDialog from '@client/src/components/OrderDialog';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    productsApi.detail(id)
      .then(data => setProduct(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>商品不存在</p>
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

      <div className="glass-card overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-purple-600/30 to-blue-600/30 relative">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-16 h-16 text-purple-400/50" />
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-white">{product.name}</h1>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold glow-text text-purple-400">¥{product.price}</div>
              <div className="text-xs text-slate-500">起</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300">
              <Tag className="w-3 h-3 inline mr-1" />
              {product.category}
            </span>
            {product.status === 'on' ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                在售
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-500/20 text-slate-400">
                已下架
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-3">服务说明</h3>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {product.description || '暂无描述'}
        </p>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-3">服务保障</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm text-slate-300">账号安全</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm text-slate-300">按时完成</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-slate-300">极速接单</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-sm text-slate-300">价格透明</span>
          </div>
        </div>
      </div>

      <div className="h-20" />

      <div className="fixed bottom-20 left-0 right-0 z-20 px-4 py-3 glass-card border-b-0 border-x-0 rounded-none">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-slate-400">总计</div>
            <div className="text-xl font-bold text-purple-400">¥{product.price}</div>
          </div>
          <button
            onClick={() => setOrderOpen(true)}
            disabled={product.status !== 'on'}
            className="btn-esports flex items-center gap-2 px-6 py-3 disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.status === 'on' ? '立即下单' : '已下架'}
          </button>
        </div>
      </div>

      <OrderDialog
        product={product}
        open={orderOpen}
        onOpenChange={setOrderOpen}
      />
    </motion.div>
  );
}
