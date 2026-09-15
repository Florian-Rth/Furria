import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAP_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'de.furria.club',
  appName: 'FURRIA Club',
  webDir: 'dist',
  server: devServerUrl ? { url: devServerUrl, cleartext: true } : undefined,
};

export default config;
