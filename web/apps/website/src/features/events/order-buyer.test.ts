import { describe, expect, it } from 'vitest';
import type { OrderBuyer } from '@/lib/seed/orders';
import { buildOrderBuyer } from './order-buyer';
import { OrderBuyerFormSchema } from './schemas';

const buildFromTyped = (firstName: string, lastName: string, email: string): OrderBuyer =>
  buildOrderBuyer(OrderBuyerFormSchema.parse({ firstName, lastName, email }));

const LENA: OrderBuyer = {
  firstName: 'Lena',
  lastName: 'Brandt',
  email: 'lena.brandt@example.de',
};

describe('buildOrderBuyer', () => {
  it('carries the typed buyer into the order payload', () => {
    expect(buildFromTyped('Lena', 'Brandt', 'lena.brandt@example.de')).toEqual(LENA);
  });

  it('hands the payload the values the form schema already trimmed', () => {
    expect(buildFromTyped('  Lena  ', ' Brandt ', ' lena.brandt@example.de ')).toEqual(LENA);
  });

  it('refuses a buyer without a name', () => {
    expect(() =>
      buildOrderBuyer({ firstName: '', lastName: 'Brandt', email: 'lena@example.de' }),
    ).toThrow();
  });

  it('refuses a buyer without a reachable address', () => {
    expect(() =>
      buildOrderBuyer({ firstName: 'Lena', lastName: 'Brandt', email: 'keine-mail' }),
    ).toThrow();
  });
});
