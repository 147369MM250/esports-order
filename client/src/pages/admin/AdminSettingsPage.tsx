import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Palette, Music, CreditCard, Headphones, User, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi, uploadApi } from '@client/src/api';
import type { SystemSettings, UpdateSettingsDto } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

const initialSettings: SystemSettings = {
  siteName: '',
  siteSubtitle: '',
  homeTitle: '',
  homeSubtitle: '',
  statOrders: '0',
  statGoodRate: '0%',
  statAvgTime: '0h',
  paymentQrUrl: '',
  serviceQrUrl: '',
  logoUrl: '',
  avatarUrl: '',
  musicIconUrl: '',
  welcomePopupEnabled: true,
  welcomePopupTitle: '',
  welcomePopupContent: '',
  welcomePopupButtonText: '',
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SystemSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then(data => setForm(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof SystemSettings) => {
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
        setForm(prev => ({ ...prev, [field]: res.url }));
        toast.success('图片上传成功');
      } catch (err) {
        toast.error('上传失败');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(form as UpdateSettingsDto);
      toast.success('保存成功');
    } catch (err) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ImageUploadField = ({ label, field, hint }: { label: string; field: keyof SystemSettings; hint?: string }) => (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>
      <label className="block w-full h-28 rounded-xl border-2 border-dashed border-purple-500/30 flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors overflow-hidden">
        {form[field] && typeof form[field] === 'string' ? (
          <Image src={form[field] as string} alt="" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-slate-400">
            <Upload className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs">{hint || '点击上传'}</p>
          </div>
        )}
        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, field)} className="hidden" />
      </label>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">系统设置</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-esports flex items-center gap-2 py-2 px-4 text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-purple-400 font-semibold">
          <Palette className="w-5 h-5" />
          <span>网站信息</span>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">网站名称</label>
          <input
            type="text"
            value={form.siteName}
            onChange={e => setForm(prev => ({ ...prev, siteName: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">网站副标题</label>
          <input
            type="text"
            value={form.siteSubtitle}
            onChange={e => setForm(prev => ({ ...prev, siteSubtitle: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">首页大标题</label>
          <input
            type="text"
            value={form.homeTitle}
            onChange={e => setForm(prev => ({ ...prev, homeTitle: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">首页副标题</label>
          <input
            type="text"
            value={form.homeSubtitle}
            onChange={e => setForm(prev => ({ ...prev, homeSubtitle: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-purple-400 font-semibold">
          <User className="w-5 h-5" />
          <span>统计数据</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">累计订单</label>
            <input
              type="text"
              value={form.statOrders}
              onChange={e => setForm(prev => ({ ...prev, statOrders: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">好评率</label>
            <input
              type="text"
              value={form.statGoodRate}
              onChange={e => setForm(prev => ({ ...prev, statGoodRate: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">平均接单</label>
            <input
              type="text"
              value={form.statAvgTime}
              onChange={e => setForm(prev => ({ ...prev, statAvgTime: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-purple-400 font-semibold">
          <CreditCard className="w-5 h-5" />
          <span>支付与客服</span>
        </div>

        <ImageUploadField label="支付二维码图片" field="paymentQrUrl" hint="上传支付二维码" />
        <ImageUploadField label="客服二维码图片" field="serviceQrUrl" hint="上传客服二维码" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-purple-400 font-semibold">
          <ImageIcon className="w-5 h-5" />
          <span>Logo 与头像</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ImageUploadField label="头像图片" field="avatarUrl" hint="上传头像" />
          <ImageUploadField label="顶部 Logo" field="logoUrl" hint="上传 Logo" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-purple-400 font-semibold">
          <Music className="w-5 h-5" />
          <span>音乐播放器</span>
        </div>

        <ImageUploadField label="音乐图标" field="musicIconUrl" hint="上传音乐图标" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-purple-400 font-semibold">
          <Headphones className="w-5 h-5" />
          <span>进站弹窗设置</span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">弹窗开关</span>
            <button
              onClick={() => setForm(prev => ({
                ...prev,
                welcomePopupEnabled: !prev.welcomePopupEnabled,
              }))}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                form.welcomePopupEnabled ? 'bg-purple-600' : 'bg-slate-700'
              }`}
              aria-label="弹窗开关"
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                form.welcomePopupEnabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">弹窗标题</label>
          <input
            type="text"
            value={form.welcomePopupTitle}
            onChange={e => setForm(prev => ({ ...prev, welcomePopupTitle: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">弹窗内容</label>
          <textarea
            value={form.welcomePopupContent}
            onChange={e => setForm(prev => ({ ...prev, welcomePopupContent: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">按钮文字</label>
          <input
            type="text"
            value={form.welcomePopupButtonText}
            onChange={e => setForm(prev => ({ ...prev, welcomePopupButtonText: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </motion.div>

      <div className="h-6" />
    </div>
  );
}
