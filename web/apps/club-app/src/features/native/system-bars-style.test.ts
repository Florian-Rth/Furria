import { SystemBarsStyle } from '@capacitor/core';
import { describe, expect, it } from 'vitest';
import { systemBarsStyleFor } from './system-bars-style';

describe('systemBarsStyleFor', () => {
  it('asks for light system bar content on the dark app background', () => {
    expect(systemBarsStyleFor('dark')).toBe(SystemBarsStyle.Dark);
  });

  it('asks for dark system bar content on the light app background', () => {
    expect(systemBarsStyleFor('light')).toBe(SystemBarsStyle.Light);
  });
});
