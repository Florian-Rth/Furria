/// <reference types="@capacitor/keyboard" />
/// <reference types="@capacitor/splash-screen" />

import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const devServerUrl = process.env.CAP_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'de.furria.club',
  appName: 'FURRIA Club',
  webDir: 'dist',
  server: devServerUrl ? { url: devServerUrl, cleartext: true } : undefined,
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
    Keyboard: {
      resize: KeyboardResize.Body,
    },
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};

export default config;
