export const MEMBERSHIP_TICKET_TILT_DEGREES = -1.5;

export const membershipTicketStubWidth = { xs: 7, desktop: 9 };

export const membershipTicketNotchRadius = 0.625;

export const membershipTicketNotchStep = 2;

export const resolveTicketRotation = (reducedMotion: boolean | null): string =>
  reducedMotion === true ? 'none' : `rotate(${MEMBERSHIP_TICKET_TILT_DEGREES}deg)`;

export const buildPerforationGradient = (notchColor: string, notchRadius: string): string =>
  `radial-gradient(circle at 50% 50%, ${notchColor} 0 ${notchRadius}, transparent ${notchRadius})`;

export const buildPerforationBackgroundSize = (notchStep: string): string => `100% ${notchStep}`;
