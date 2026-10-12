import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Tag, ListOrdered, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { categoriesApi } from '@client/src/api';
import type { Category, DeleteCategoryResponse } from '@shared/api.interface';

interface CategoryFormData {
  key: string;
  label: string;
  sortOrder: string;
}

const initialForm: CategoryFormData = {
  key: '',
  label: '',
  sortOrder: '0',
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      const sorted = [...data].sort((a: Category, b: Category) => a.sortOrder - b.sortOrder);
      setCategories(sorted);
    } catch (err) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowDialog(true);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      key: category.key,
      label: category.label,
      sortOrder: String(category.sortOrder),
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res: DeleteCategoryResponse = await categoriesApi.remove(id);
      if (res.needConfirm && (res.productCount ?? 0) > 0) {
        const confirmed = window.confirm(
          `该分类下还有 ${res.productCount} 个商品，确定删除吗？商品的分类将被清空`
        );
        if (!confirmed) return;
        await categoriesApi.remove(id, true);
      }
      toast.success('删除成功');
      fetchCategories();
    } catch (err) {
      toast.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    if (!form.key.trim()) {
      toast.error('请填写分类标识');
      return;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(form.key.trim())) {
      toast.error('分类标识需以小写字母开头，仅包含小写字母、数字和下划线');
      return;
    }
    if (!form.label.trim()) {
      toast.error('请填写分类名称');
      return;
    }

    setSubmitting(true);
    try {
      const dto = {
        key: form.key.trim(),
        label: form.label.trim(),
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await categoriesApi.update(editingId, dto);
        toast.success('更新成功');
      } else {
        await categoriesApi.create(dto);
        toast.success('创建成功');
      }
      setShowDialog(false);
      fetchCategories();
    } catch (err) {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">分类管理</h1>
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
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-slate-400 glass-card">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无分类</p>
            <button onClick={handleAdd} className="btn-esports mt-4 text-sm py-2 px-4">
              添加第一个分类
            </button>
          </div>
        ) : (
          categories.map(category => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-3 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex-shrink-0 flex items-center justify-center text-purple-400">
                <Tag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate flex items-center gap-2">
                  {category.label}
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    {category.key}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <ListOrdered className="w-3 h-3" />
                  排序：{category.sortOrder}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                  aria-label="编辑"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                  aria-label="删除"
                >
                  <Trash2 className="w-4 h-4" />
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
                  {editingId ? '编辑分类' : '新增分类'}
                </h3>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    分类标识 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={form.key}
                      onChange={e => setForm(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="如：rank"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">英文小写，用于代码中标识分类</p>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    分类名称 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={form.label}
                      onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="如：排位代练"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    排序
                  </label>
                  <div className="relative">
                    <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={e => setForm(prev => ({ ...prev, sortOrder: e.target.value }))}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">数字越小越靠前</p>
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
