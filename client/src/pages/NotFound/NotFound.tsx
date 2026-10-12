import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Zap } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold gradient-text mb-2">404</h1>
        <p className="text-slate-400 mb-8">页面不存在或已被移除</p>
        <button
          onClick={() => navigate('/')}
          className="btn-esports inline-flex items-center gap-2 px-6 py-3"
        >
          <Home className="w-5 h-5" />
          返回首页
        </button>
      </motion.div>
    </div>
  );
}
