import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Tag, DollarSign, ListOrdered, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi, uploadApi, categoriesApi } from '@client/src/api';
import type { Product, CategoryItem } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  imageUrl: string;
  sortOrder: string;
  status: 'on' | 'off';
}

const initialForm: ProductFormData = {
  name: '',
  price: '',
  description: '',
  category: '',
  imageUrl: '',
  sortOrder: '0',
  status: 'on',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryFocused, setCategoryFocused] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch (err) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data.map(c => ({ key: c.key, label: c.label })));
    } catch (err) {
      try {
        const data = await productsApi.categories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setCategoryInput('');
    setShowDialog(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      sortOrder: String(product.sortOrder),
      status: product.status,
    });
    const matched: CategoryItem | undefined = categories.find(c => c.key === product.category);
    setCategoryInput(matched ? matched.label : product.category);
    setShowDialog(true);
  };

  const resolveCategoryKey = async (): Promise<string> => {
    const input: string = categoryInput.trim();
    if (!input) {
      throw new Error('请填写分类');
    }
    const byKey: CategoryItem | undefined = categories.find(c => c.key === input);
    if (byKey) return byKey.key;
    const byLabel: CategoryItem | undefined = categories.find(c => c.label === input);
    if (byLabel) return byLabel.key;
    const key: string = `cat_${Date.now().toString(36)}`;
    const created = await categoriesApi.create({
      key,
      label: input,
      sortOrder: categories.length + 1,
    });
    setCategories(prev => [...prev, { key: created.key, label: created.label }]);
    return created.key;
  };

  const filteredCategoryOptions = categoryFocused || !categoryInput.trim()
    ? categories.filter(c => {
        const keyword: string = categoryInput.trim().toLowerCase();
        if (!keyword) return true;
        return c.key.toLowerCase().includes(keyword) || c.label.toLowerCase().includes(keyword);
      })
    : [];

  const isNewCategory = categoryInput.trim() !== '' &&
    !categories.some(c => c.key === categoryInput.trim() || c.label === categoryInput.trim());

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除此商品？')) return;
    try {
      await productsApi.remove(id);
      toast.success('删除成功');
      fetchProducts();
    } catch (err) {
      toast.error('删除失败');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await uploadApi.image(base64, file.name);
        setForm(prev => ({ ...prev, imageUrl: res.url }));
        toast.success('图片上传成功');
      } catch (err) {
        toast.error('上传失败');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('请填写商品名称');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error('请填写正确的价格');
      return;
    }
    if (!categoryInput.trim()) {
      toast.error('请填写或选择分类');
      return;
    }

    setSubmitting(true);
    try {
      const categoryKey: string = await resolveCategoryKey();
      const dto = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        category: categoryKey,
        imageUrl: form.imageUrl,
        sortOrder: Number(form.sortOrder) || 0,
        status: form.status,
      };
      if (editingId) {
        await productsApi.update(editingId, dto);
        toast.success('更新成功');
      } else {
        await productsApi.create(dto);
        toast.success('创建成功');
      }
      setShowDialog(false);
      fetchProducts();
    } catch (err) {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 'on' ? 'off' : 'on';
      await productsApi.update(product.id, { status: newStatus });
      toast.success(newStatus === 'on' ? '已上架' : '已下架');
      fetchProducts();
    } catch (err) {
      toast.error('操作失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">商品管理</h1>
        <button
          onClick={handleAdd}
          className="btn-esports flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus className="w-4 h-4" />
          新增
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-400 glass-card">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无商品</p>
            <button onClick={handleAdd} className="btn-esports mt-4 text-sm py-2 px-4">
              添加第一个商品
            </button>
          </div>
        ) : (
          products.map(product => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-3 flex items-center gap-3"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex-shrink-0 overflow-hidden">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-400">
                    <Zap className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate flex items-center gap-2">
                  {product.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    product.status === 'on' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/30 text-slate-400'
                  }`}>
                    {product.status === 'on' ? '在售' : '下架'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{product.description}</div>
                <div className="text-purple-400 font-bold text-sm mt-1">¥{product.price}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                  aria-label="编辑"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleStatus(product)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    product.status === 'on'
                      ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                  aria-label={product.status === 'on' ? '下架' : '上架'}
                >
                  {product.status === 'on' ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl glass-card border-b-0 border-x-0 max-h-[85vh] overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? '编辑商品' : '新增商品'}
                </h3>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">商品图片</label>
                  <label className="block w-full h-32 rounded-xl border-2 border-dashed border-purple-500/30 flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors overflow-hidden">
                    {form.imageUrl ? (
                      <Image src={form.imageUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <Upload className="w-8 h-8 mx-auto mb-1" />
                        <p className="text-xs">点击上传图片</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    商品名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入商品名称"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">价格 (元) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">排序</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={e => setForm(prev => ({ ...prev, sortOrder: e.target.value }))}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm text-slate-300 mb-2">分类</label>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={e => {
                      setCategoryInput(e.target.value);
                      setForm(prev => ({ ...prev, category: '' }));
                    }}
                    onFocus={() => setCategoryFocused(true)}
                    onBlur={() => setTimeout(() => setCategoryFocused(false), 150)}
                    placeholder="选择已有分类或输入新分类名"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  {filteredCategoryOptions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-10 max-h-44 overflow-y-auto rounded-xl bg-slate-900 border border-purple-500/30 shadow-lg shadow-black/40">
                      {filteredCategoryOptions.map(cat => (
                        <button
                          key={cat.key}
                          type="button"
                          onMouseDown={() => {
                            setCategoryInput(cat.label);
                            setForm(prev => ({ ...prev, category: cat.key }));
                            setCategoryFocused(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-white hover:bg-purple-500/20 transition-colors"
                        >
                          <span>{cat.label}</span>
                          <span className="text-xs text-slate-500">{cat.key}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {isNewCategory && (
                    <p className="text-xs text-purple-400 mt-1">
                      保存时将自动创建新分类：{categoryInput.trim()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">商品描述</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="请输入商品描述"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">状态</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setForm(prev => ({ ...prev, status: 'on' }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                        form.status === 'on'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-white/5 text-slate-400 border border-purple-500/20'
                      }`}
                    >
                      上架
                    </button>
                    <button
                      onClick={() => setForm(prev => ({ ...prev, status: 'off' }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                        form.status === 'off'
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                          : 'bg-white/5 text-slate-400 border border-purple-500/20'
                      }`}
                    >
                      下架
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDialog(false)}
                    className="flex-1 py-3 rounded-xl btn-outline"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl btn-esports disabled:opacity-50"
                  >
                    {submitting ? '提交中...' : '保存'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
