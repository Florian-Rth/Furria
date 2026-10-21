export type InstallBrowser =
  | 'ios-safari'
  | 'ios-other'
  | 'android-chrome'
  | 'android-samsung'
  | 'android-firefox'
  | 'android-other'
  | 'in-app'
  | 'desktop';

export type InstallDevice = 'phone' | 'tablet' | 'desktop';

export type InstallSystem = 'ios' | 'android' | 'other';

export interface BrowserTraits {
  userAgent: string;
  maxTouchPoints: number;
  mobileHint: boolean | null;
}

export interface InstallTarget {
  system: InstallSystem;
  browser: InstallBrowser;
  device: InstallDevice;
  safariMajor: number | null;
}

const IN_APP =
  /Instagram|FBAN|FBAV|FB_IAB|FBIOS|LinkedInApp|Snapchat|TikTok|BytedanceWebview|musical_ly|Line\/|Twitter|Pinterest|GSA\//;
const IOS_DEVICE = /iPhone|iPad|iPod/;
const IOS_TABLET = /iPad/;
const IOS_OTHER = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|Ddg\//;
const ANDROID = /Android/;
const ANDROID_WEBVIEW = /; wv\)/;
const ANDROID_PHONE = /Mobile/;
const ANDROID_OTHER = /EdgA|OPR\/|MiuiBrowser|YaBrowser|UCBrowser|HuaweiBrowser/;
const SAMSUNG = /SamsungBrowser/;
const FIREFOX = /Firefox\//;
const CHROME = /Chrome\/[\d.]+/;
const SAFARI_TOKEN = /Safari\//;
const SAFARI_VERSION = /Version\/(\d+)/;
const MACINTOSH = /Macintosh/;
const TOUCH_MAC_POINTS = 1;

const isTouchMac = ({ userAgent, maxTouchPoints }: BrowserTraits): boolean =>
  MACINTOSH.test(userAgent) && maxTouchPoints > TOUCH_MAC_POINTS;

const isIos = (traits: BrowserTraits): boolean =>
  IOS_DEVICE.test(traits.userAgent) || isTouchMac(traits);

const iosBrowserOf = (userAgent: string): InstallBrowser => {
  if (IOS_OTHER.test(userAgent)) {
    return 'ios-other';
  }
  if (!SAFARI_TOKEN.test(userAgent)) {
    return 'in-app';
  }
  return 'ios-safari';
};

const androidBrowserOf = (userAgent: string): InstallBrowser => {
  if (ANDROID_WEBVIEW.test(userAgent)) {
    return 'in-app';
  }
  if (SAMSUNG.test(userAgent)) {
    return 'android-samsung';
  }
  if (FIREFOX.test(userAgent)) {
    return 'android-firefox';
  }
  if (ANDROID_OTHER.test(userAgent)) {
    return 'android-other';
  }
  return CHROME.test(userAgent) ? 'android-chrome' : 'android-other';
};

const iosDeviceOf = (traits: BrowserTraits): InstallDevice =>
  IOS_TABLET.test(traits.userAgent) || isTouchMac(traits) ? 'tablet' : 'phone';

const safariMajorOf = (userAgent: string): number | null => {
  const match = SAFARI_VERSION.exec(userAgent);
  return match === null ? null : Number(match[1]);
};

export const installTargetOf = (traits: BrowserTraits): InstallTarget => {
  const { userAgent } = traits;

  if (isIos(traits)) {
    const browser = IN_APP.test(userAgent) ? 'in-app' : iosBrowserOf(userAgent);
    return {
      system: 'ios',
      browser,
      device: iosDeviceOf(traits),
      safariMajor: safariMajorOf(userAgent),
    };
  }
  if (ANDROID.test(userAgent)) {
    const browser = IN_APP.test(userAgent) ? 'in-app' : androidBrowserOf(userAgent);
    const device = ANDROID_PHONE.test(userAgent) ? 'phone' : 'tablet';
    return { system: 'android', browser, device, safariMajor: null };
  }
  if (traits.mobileHint === true) {
    return { system: 'other', browser: 'android-other', device: 'phone', safariMajor: null };
  }
  return { system: 'other', browser: 'desktop', device: 'desktop', safariMajor: null };
};
