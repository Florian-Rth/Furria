import { describe, expect, it } from 'vitest';
import {
  buildPerforationBackgroundSize,
  buildPerforationGradient,
  MEMBERSHIP_TICKET_TILT_DEGREES,
  resolveTicketRotation,
} from './ticket-shape';

describe('resolveTicketRotation', () => {
  it('lets the ticket lie on the page at a slight angle', () => {
    expect(resolveTicketRotation(false)).toBe(`rotate(${MEMBERSHIP_TICKET_TILT_DEGREES}deg)`);
  });

  it('keeps the tilt while the motion preference is still unknown', () => {
    expect(resolveTicketRotation(null)).toBe(`rotate(${MEMBERSHIP_TICKET_TILT_DEGREES}deg)`);
  });

  it('straightens the ticket when the visitor asked for reduced motion', () => {
    expect(resolveTicketRotation(true)).toBe('none');
  });

  it('tilts by a degree and a half, counter-clockwise', () => {
    expect(MEMBERSHIP_TICKET_TILT_DEGREES).toBe(-1.5);
  });
});

describe('buildPerforationGradient', () => {
  it('punches a notch of the surrounding page colour out of the seam', () => {
    expect(buildPerforationGradient('#FBF4E6', '5px')).toBe(
      'radial-gradient(circle at 50% 50%, #FBF4E6 0 5px, transparent 5px)',
    );
  });

  it('takes the notch colour from whatever the scheme hands it', () => {
    expect(buildPerforationGradient('var(--kk-bg)', '4px')).toBe(
      'radial-gradient(circle at 50% 50%, var(--kk-bg) 0 4px, transparent 4px)',
    );
  });
});

describe('buildPerforationBackgroundSize', () => {
  it('repeats one notch per step down the seam', () => {
    expect(buildPerforationBackgroundSize('16px')).toBe('100% 16px');
  });
});
