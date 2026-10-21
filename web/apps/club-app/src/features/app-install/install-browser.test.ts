import { describe, expect, it } from 'vitest';
import { installTargetOf } from './install-browser';

const IPHONE_SAFARI_26 =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';
const IPHONE_SAFARI_27 =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1';
const IPHONE_SAFARI_17 =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.41 Mobile/15E148 Safari/604.1';
const IPHONE_INSTAGRAM =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 400.0.0.0 (iPhone15,2; iOS 18_6; de_DE)';
const IPHONE_WEBVIEW =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const IPAD_AS_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
const MAC_SAFARI = IPAD_AS_MAC;
const PIXEL_CHROME =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const ANDROID_TABLET_CHROME =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const ANDROID_WEBVIEW =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.0.0 Mobile Safari/537.36';
const SAMSUNG =
  'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36';
const ANDROID_FIREFOX = 'Mozilla/5.0 (Android 14; Mobile; rv:144.0) Gecko/144.0 Firefox/144.0';
const ANDROID_EDGE =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 EdgA/141.0.0.0';
const ANDROID_FACEBOOK =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0.0.0;]';
const WINDOWS_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

describe('installTargetOf', () => {
  it.each([
    {
      label: 'iPhone Safari 26',
      traits: { userAgent: IPHONE_SAFARI_26, maxTouchPoints: 5, mobileHint: null },
      expected: { system: 'ios', browser: 'ios-safari', device: 'phone', safariMajor: 26 },
    },
    {
      label: 'iPhone Safari 27',
      traits: { userAgent: IPHONE_SAFARI_27, maxTouchPoints: 5, mobileHint: null },
      expected: { system: 'ios', browser: 'ios-safari', device: 'phone', safariMajor: 27 },
    },
    {
      label: 'iPhone Safari 17',
      traits: { userAgent: IPHONE_SAFARI_17, maxTouchPoints: 5, mobileHint: null },
      expected: { system: 'ios', browser: 'ios-safari', device: 'phone', safariMajor: 17 },
    },
    {
      label: 'Chrome on iPhone',
      traits: { userAgent: IPHONE_CHROME, maxTouchPoints: 5, mobileHint: null },
      expected: { system: 'ios', browser: 'ios-other', device: 'phone', safariMajor: null },
    },
    {
      label: 'Instagram on iPhone',
      traits: { userAgent: IPHONE_INSTAGRAM, maxTouchPoints: 5, mobileHint: null },
      expected: { system: 'ios', browser: 'in-app', device: 'phone', safariMajor: null },
    },
    {
      label: 'an iPhone web view without the Safari token',
      traits: { userAgent: IPHONE_WEBVIEW, maxTouchPoints: 5, mobileHint: null },
      expected: { system: 'ios', browser: 'in-app', device: 'phone', safariMajor: null },
    },
    {
      label: 'an iPad posing as a Mac',
      traits: { userAgent: IPAD_AS_MAC, maxTouchPoints: 5, mobileHint: null },
      expected: { system: 'ios', browser: 'ios-safari', device: 'tablet', safariMajor: 26 },
    },
    {
      label: 'a real Mac',
      traits: { userAgent: MAC_SAFARI, maxTouchPoints: 0, mobileHint: null },
      expected: { system: 'other', browser: 'desktop', device: 'desktop', safariMajor: null },
    },
    {
      label: 'Chrome on a Pixel',
      traits: { userAgent: PIXEL_CHROME, maxTouchPoints: 5, mobileHint: true },
      expected: {
        system: 'android',
        browser: 'android-chrome',
        device: 'phone',
        safariMajor: null,
      },
    },
    {
      label: 'Chrome on an Android tablet',
      traits: { userAgent: ANDROID_TABLET_CHROME, maxTouchPoints: 5, mobileHint: false },
      expected: {
        system: 'android',
        browser: 'android-chrome',
        device: 'tablet',
        safariMajor: null,
      },
    },
    {
      label: 'an Android web view',
      traits: { userAgent: ANDROID_WEBVIEW, maxTouchPoints: 5, mobileHint: true },
      expected: { system: 'android', browser: 'in-app', device: 'phone', safariMajor: null },
    },
    {
      label: 'Facebook on Android',
      traits: { userAgent: ANDROID_FACEBOOK, maxTouchPoints: 5, mobileHint: true },
      expected: { system: 'android', browser: 'in-app', device: 'phone', safariMajor: null },
    },
    {
      label: 'Samsung Internet',
      traits: { userAgent: SAMSUNG, maxTouchPoints: 5, mobileHint: true },
      expected: {
        system: 'android',
        browser: 'android-samsung',
        device: 'phone',
        safariMajor: null,
      },
    },
    {
      label: 'Firefox on Android',
      traits: { userAgent: ANDROID_FIREFOX, maxTouchPoints: 5, mobileHint: null },
      expected: {
        system: 'android',
        browser: 'android-firefox',
        device: 'phone',
        safariMajor: null,
      },
    },
    {
      label: 'Edge on Android',
      traits: { userAgent: ANDROID_EDGE, maxTouchPoints: 5, mobileHint: true },
      expected: { system: 'android', browser: 'android-other', device: 'phone', safariMajor: null },
    },
    {
      label: 'Chrome on Windows',
      traits: { userAgent: WINDOWS_CHROME, maxTouchPoints: 0, mobileHint: false },
      expected: { system: 'other', browser: 'desktop', device: 'desktop', safariMajor: null },
    },
    {
      label: 'an unknown phone that says it is mobile',
      traits: { userAgent: 'KaiOS/3.0', maxTouchPoints: 1, mobileHint: true },
      expected: { system: 'other', browser: 'android-other', device: 'phone', safariMajor: null },
    },
  ] as const)('$label', ({ traits, expected }) => {
    expect(installTargetOf(traits)).toEqual(expected);
  });
});
