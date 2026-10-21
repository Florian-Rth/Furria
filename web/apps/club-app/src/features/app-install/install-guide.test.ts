import { describe, expect, it } from 'vitest';
import { installGuideOf } from './install-guide';

describe('installGuideOf', () => {
  it.each([
    {
      label: 'Safari 27 on an iPhone goes through the page menu',
      target: { system: 'ios', browser: 'ios-safari', device: 'phone', safariMajor: 27 },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['safari-page-menu', 'safari-share', 'home-screen-list', 'web-app-add'],
      },
    },
    {
      label: 'Safari 26 on an iPhone goes through the more menu',
      target: { system: 'ios', browser: 'ios-safari', device: 'phone', safariMajor: 26 },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['safari-more', 'safari-share', 'home-screen', 'add-web-app'],
      },
    },
    {
      label: 'older Safari on an iPhone shares from the bottom bar',
      target: { system: 'ios', browser: 'ios-safari', device: 'phone', safariMajor: 18 },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['share-bar', 'home-screen', 'add'],
      },
    },
    {
      label: 'Safari without a version token falls back to the bottom bar',
      target: { system: 'ios', browser: 'ios-safari', device: 'phone', safariMajor: null },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['share-bar', 'home-screen', 'add'],
      },
    },
    {
      label: 'Safari on an iPad shares from the top',
      target: { system: 'ios', browser: 'ios-safari', device: 'tablet', safariMajor: 26 },
      canPrompt: false,
      expected: { kind: 'steps', steps: ['share-top', 'home-screen', 'add'] },
    },
    {
      label: 'another iPhone browser shares from its address bar',
      target: { system: 'ios', browser: 'ios-other', device: 'phone', safariMajor: null },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['address-share', 'home-screen', 'add'],
      },
    },
    {
      label: 'an app browser on the iPhone escapes to Safari',
      target: { system: 'ios', browser: 'in-app', device: 'phone', safariMajor: null },
      canPrompt: false,
      expected: {
        kind: 'escape',
        exit: 'safari',
        steps: ['in-app-menu', 'open-in-safari'],
      },
    },
    {
      label: 'an app browser on Android escapes to Chrome even when it could prompt',
      target: { system: 'android', browser: 'in-app', device: 'phone', safariMajor: null },
      canPrompt: true,
      expected: {
        kind: 'escape',
        exit: 'chrome',
        steps: ['in-app-menu', 'open-in-browser'],
      },
    },
    {
      label: 'Chrome with a ready prompt installs in one tap',
      target: { system: 'android', browser: 'android-chrome', device: 'phone', safariMajor: null },
      canPrompt: true,
      expected: { kind: 'prompt' },
    },
    {
      label: 'Samsung Internet with a ready prompt installs in one tap',
      target: { system: 'android', browser: 'android-samsung', device: 'phone', safariMajor: null },
      canPrompt: true,
      expected: { kind: 'prompt' },
    },
    {
      label: 'Chrome without a prompt goes through its menu',
      target: { system: 'android', browser: 'android-chrome', device: 'phone', safariMajor: null },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['chrome-menu', 'chrome-install', 'chrome-confirm'],
      },
    },
    {
      label: 'Samsung Internet without a prompt goes through its bottom menu',
      target: { system: 'android', browser: 'android-samsung', device: 'phone', safariMajor: null },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['samsung-menu', 'samsung-add-page', 'samsung-home'],
      },
    },
    {
      label: 'Firefox on Android goes through its menu',
      target: { system: 'android', browser: 'android-firefox', device: 'phone', safariMajor: null },
      canPrompt: false,
      expected: {
        kind: 'steps',
        steps: ['firefox-menu', 'firefox-add', 'firefox-confirm'],
      },
    },
    {
      label: 'any other Android browser is sent to Chrome',
      target: { system: 'android', browser: 'android-other', device: 'phone', safariMajor: null },
      canPrompt: false,
      expected: { kind: 'escape', exit: 'chrome', steps: [] },
    },
  ] as const)('$label', ({ target, canPrompt, expected }) => {
    expect(installGuideOf(target, canPrompt)).toEqual(expected);
  });
});
