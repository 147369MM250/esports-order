import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsApi } from '@/api';
import type { SystemSettings } from '@shared/api.interface';

interface AppContextType {
  settings: SystemSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await settingsApi.get();
      setSettings(data);
    } catch (err) {
      console.error('加载设置失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <AppContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppProvider');
  return ctx;
}
