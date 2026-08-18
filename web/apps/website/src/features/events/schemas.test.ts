import { describe, expect, it } from 'vitest';
import { OrderFlowSearchSchema } from './schemas';

type UrlSearch = Record<string, string | string[] | null>;

const parseStep = (search: UrlSearch): number | undefined =>
  OrderFlowSearchSchema.parse(search).step;

describe('OrderFlowSearchSchema', () => {
  it('reads a step of the flow from the URL string', () => {
    expect(parseStep({ step: '2' })).toBe(2);
  });

  it('leaves the param out when it is absent', () => {
    expect(parseStep({})).toBeUndefined();
  });

  it('normalises garbage to no param instead of throwing', () => {
    expect(parseStep({ step: 'zwölf' })).toBeUndefined();
    expect(parseStep({ step: '' })).toBeUndefined();
    expect(parseStep({ step: '3.5' })).toBeUndefined();
    expect(parseStep({ step: '-2' })).toBeUndefined();
    expect(parseStep({ step: '0' })).toBeUndefined();
    expect(parseStep({ step: '9' })).toBeUndefined();
    expect(parseStep({ step: ['1', '2'] })).toBeUndefined();
    expect(parseStep({ step: null })).toBeUndefined();
  });

  it('ignores unrelated params', () => {
    expect(parseStep({ schritt: '2' })).toBeUndefined();
  });
});
