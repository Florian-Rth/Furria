export const STEP_BORDER_TOLERANCE_SECONDS = 0.01;

export interface StepSpan {
  start: number;
  end: number;
}

export const nearBorder = (left: number, right: number): boolean =>
  Math.abs(left - right) < STEP_BORDER_TOLERANCE_SECONDS;

export const splitsTheTailOf = (owner: StepSpan, added: StepSpan): boolean =>
  owner.start < added.start - STEP_BORDER_TOLERANCE_SECONDS &&
  owner.end > added.start + STEP_BORDER_TOLERANCE_SECONDS &&
  nearBorder(owner.end, added.end);
