export interface LabBeerPerson {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
}

export interface LabBeerPot {
  id: number;
  ownerId: number;
  priceCents: number;
  paymentLink: string | null;
  paymentNote: string | null;
  openedAt: string;
  bookingPath: string;
}

export interface LabBeerEnrollment {
  personId: number;
  startedAt: string;
  endedAt: string | null;
  endedById: number | null;
}

export interface LabBeerCrate {
  id: number;
  personId: number;
  priceCents: number;
  enteredById: number;
  bookedAt: string;
  undoneAt: string | null;
}

export interface LabBeerPayment {
  id: number;
  personId: number;
  crateCount: number;
  bookedById: number;
  bookedAt: string;
}

export type LabBeerMovementKind = 'delivery' | 'correction' | 'handoverCarry';

export type LabBeerCorrectionReason = 'shrinkage' | 'breakage' | 'miscount';

export interface LabBeerStockMovement {
  id: number;
  kind: LabBeerMovementKind;
  count: number;
  reason: LabBeerCorrectionReason | null;
  bookedById: number;
  bookedAt: string;
}

export interface LabBeerWorld {
  now: string;
  pot: LabBeerPot;
  persons: readonly LabBeerPerson[];
  operatorIds: readonly number[];
  enrollments: readonly LabBeerEnrollment[];
  crates: readonly LabBeerCrate[];
  payments: readonly LabBeerPayment[];
  movements: readonly LabBeerStockMovement[];
}

export interface LabBeerTabCrate {
  crate: LabBeerCrate;
  paidBy: LabBeerPayment | null;
}

export interface LabBeerTab {
  personId: number;
  crates: readonly LabBeerTabCrate[];
  openCount: number;
  openCents: number;
  paidCount: number;
  oldestOpenAt: string | null;
}

export interface LabBeerForecast {
  pacePerDay: number;
  emptyOn: string | null;
  warns: boolean;
}

export interface LabBeerGiver {
  personId: number;
  crateCount: number;
  lastAt: string;
}
