/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface RuntimeConfig {
  API_BASE_URL?: string;
}

interface InstallChoice {
  outcome: 'accepted' | 'dismissed';
  platform: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  readonly userChoice: Promise<InstallChoice>;
}

interface RelatedApplication {
  platform: string;
  url?: string;
  id?: string;
}

interface Window {
  __RUNTIME_CONFIG__?: RuntimeConfig;
  __installPrompt?: BeforeInstallPromptEvent | null;
  __appInstalled?: boolean;
}

interface NavigatorUserAgentHints {
  mobile: boolean;
}

interface Navigator {
  standalone?: boolean;
  userAgentData?: NavigatorUserAgentHints;
  getInstalledRelatedApps?: () => Promise<readonly RelatedApplication[]>;
}
