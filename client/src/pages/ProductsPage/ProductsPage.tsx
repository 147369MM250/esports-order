import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Grid, List } from 'lucide-react';
import { productsApi, categoriesApi } from '@client/src/api';
import type { Product, CategoryItem } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    Promise.all([
      productsApi.list({ pageSize: 100 }),
      categoriesApi.list().catch(() => []),
    ])
      .then(([productsData, catsData]) => {
        setProducts(productsData);
        if (catsData && Array.isArray(catsData)) {
          setCategories(catsData.map((c: any) => ({
            key: c.key || c.id,
            label: c.label || c.name,
          })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">全部商品</h1>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-white/5 text-slate-400'
            }`}
            aria-label="网格视图"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-white/5 text-slate-400'
            }`}
            aria-label="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索商品..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-white/5 text-slate-400 border border-purple-500/20'
          }`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.key
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-slate-400 border border-purple-500/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-slate-400 glass-card">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>暂无商品</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div layout className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="glass-card overflow-hidden cursor-pointer hover:border-purple-500/50 transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-600/30 to-blue-600/30 relative">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="w-10 h-10 text-purple-400/50" />
                    </div>
                  )}
                  {product.status === 'off' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-slate-300 text-sm">已下架</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-white text-sm truncate">{product.name}</div>
                  <div className="text-purple-400 font-bold mt-1">¥{product.price}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
