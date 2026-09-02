import { describe, expect, it } from 'vitest';
import type { EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import {
  deriveCapacityBarColor,
  deriveSalesShortLabel,
  deriveSalesStatusLabel,
  deriveSalesUrgency,
  deriveSalesUrgencyColor,
  isLiveSaleStatus,
} from './sales-status-display';

const midPresale = new Date('2026-12-01T12:00');

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  description: null,
  performers: null,
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 100,
};

const announced = buildEvent(
  { ...baseFacts, priceCents: null, capacity: null, presaleStartsAt: null, freeCount: null },
  midPresale,
);
const presaleScheduled = buildEvent(
  { ...baseFacts, presaleStartsAt: '2027-01-10T10:00', freeCount: null },
  midPresale,
);
const onSale = buildEvent(baseFacts, midPresale);
const almostSoldOut = buildEvent({ ...baseFacts, freeCount: 12 }, midPresale);
const soldOut = buildEvent({ ...baseFacts, freeCount: 0 }, midPresale);
const salesClosed = buildEvent({ ...baseFacts, presaleEndsAt: '2026-11-30T23:59' }, midPresale);
const cancelled = buildCancelledEvent(baseFacts);

describe('deriveSalesStatusLabel', () => {
  it('phrases every lifecycle state in German', () => {
    expect(deriveSalesStatusLabel(announced)).toBe('Vorverkauf folgt');
    expect(deriveSalesStatusLabel(presaleScheduled)).toBe('Vorverkauf ab 10.01.2027');
    expect(deriveSalesStatusLabel(onSale)).toBe('100 von 260 frei');
    expect(deriveSalesStatusLabel(almostSoldOut)).toBe('12 von 260 frei');
    expect(deriveSalesStatusLabel(soldOut)).toBe('Ausverkauft');
    expect(deriveSalesStatusLabel(salesClosed)).toBe('Vorverkauf beendet');
    expect(deriveSalesStatusLabel(cancelled)).toBe('Abgesagt');
  });

  it('keeps one phrasing for open and scarce seats, urgency travels as color', () => {
    expect(deriveSalesStatusLabel(onSale)).toMatch(/von 260 frei$/);
    expect(deriveSalesStatusLabel(almostSoldOut)).toMatch(/von 260 frei$/);
  });
});

describe('deriveSalesShortLabel', () => {
  it('shortens every lifecycle state for badges', () => {
    expect(deriveSalesShortLabel(announced)).toBe('Bald');
    expect(deriveSalesShortLabel(presaleScheduled)).toBe('Ab 10.01.');
    expect(deriveSalesShortLabel(onSale)).toBe('100 frei');
    expect(deriveSalesShortLabel(almostSoldOut)).toBe('12 frei');
    expect(deriveSalesShortLabel(soldOut)).toBe('Ausverkauft');
    expect(deriveSalesShortLabel(salesClosed)).toBe('Verkauf beendet');
    expect(deriveSalesShortLabel(cancelled)).toBe('Abgesagt');
  });
});

describe('deriveSalesUrgency', () => {
  it('maps every lifecycle state onto an urgency kind', () => {
    expect(deriveSalesUrgency('announced')).toBe('upcoming');
    expect(deriveSalesUrgency('presaleScheduled')).toBe('upcoming');
    expect(deriveSalesUrgency('onSale')).toBe('open');
    expect(deriveSalesUrgency('almostSoldOut')).toBe('scarce');
    expect(deriveSalesUrgency('soldOut')).toBe('exhausted');
    expect(deriveSalesUrgency('salesClosed')).toBe('exhausted');
    expect(deriveSalesUrgency('cancelled')).toBe('cancelled');
  });
});

describe('deriveSalesUrgencyColor', () => {
  it('maps every lifecycle state onto a badge color', () => {
    expect(deriveSalesUrgencyColor('announced')).toBe('info');
    expect(deriveSalesUrgencyColor('presaleScheduled')).toBe('info');
    expect(deriveSalesUrgencyColor('onSale')).toBe('success');
    expect(deriveSalesUrgencyColor('almostSoldOut')).toBe('warning');
    expect(deriveSalesUrgencyColor('soldOut')).toBe('default');
    expect(deriveSalesUrgencyColor('salesClosed')).toBe('default');
    expect(deriveSalesUrgencyColor('cancelled')).toBe('error');
  });
});

describe('isLiveSaleStatus', () => {
  it('treats only running sales as live', () => {
    expect(isLiveSaleStatus('onSale')).toBe(true);
    expect(isLiveSaleStatus('almostSoldOut')).toBe(true);
    expect(isLiveSaleStatus('announced')).toBe(false);
    expect(isLiveSaleStatus('presaleScheduled')).toBe(false);
    expect(isLiveSaleStatus('soldOut')).toBe(false);
    expect(isLiveSaleStatus('salesClosed')).toBe(false);
    expect(isLiveSaleStatus('cancelled')).toBe(false);
  });
});

describe('deriveCapacityBarColor', () => {
  it('turns the bar warning-colored only when seats get scarce', () => {
    expect(deriveCapacityBarColor('onSale')).toBe('success');
    expect(deriveCapacityBarColor('almostSoldOut')).toBe('warning');
  });
});
