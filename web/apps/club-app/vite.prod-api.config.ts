import type { ConfigEnv, UserConfig } from 'vite';
import { mergeConfig } from 'vite';
import base from './vite.config';

export default async (env: ConfigEnv): Promise<UserConfig> => {
  const resolved = typeof base === 'function' ? await base(env) : base;
  return mergeConfig(resolved, {
    server: { proxy: { '/api': { target: 'http://localhost:2081', changeOrigin: true } } },
  });
};
