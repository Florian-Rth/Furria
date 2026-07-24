import { describe, expect, it } from 'vitest';
import { narrenrufBandContent } from './narrenruf-content';

describe('narrenrufBandContent', () => {
  it('states the exclusive-narrenruf kicker verbatim', () => {
    expect(narrenrufBandContent.kicker).toBe('UNSER NARRENRUF — UND NUR DIESER');
  });

  it('keeps the rejection sentence verbatim with German quote glyphs', () => {
    expect(narrenrufBandContent.sentence).toBe(
      'Kein „Helau“. Kein „Alaaf“. Wer bei FURRIA feiert, ruft Groß — und die ganze Halle antwortet.',
    );
  });

  it('shouts the club narrenruf Groß · Furria across two lines', () => {
    expect(narrenrufBandContent.shoutLead).toBe('GROSS');
    expect(narrenrufBandContent.shoutCall).toBe('FURRIA!');
  });

  it('never adopts Helau or Alaaf as the club shout', () => {
    const shout = `${narrenrufBandContent.shoutLead} ${narrenrufBandContent.shoutCall}`;
    expect(shout).not.toMatch(/helau|alaaf/i);
  });

  it('names Helau and Alaaf only to reject them in the sentence', () => {
    expect(narrenrufBandContent.sentence).toMatch(/Kein „Helau“/);
    expect(narrenrufBandContent.sentence).toMatch(/Kein „Alaaf“/);
  });
});
