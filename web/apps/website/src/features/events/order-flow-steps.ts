export const ORDER_FLOW_STEPS = [1, 2, 3] as const;

export type OrderFlowStep = (typeof ORDER_FLOW_STEPS)[number];

export const FIRST_ORDER_FLOW_STEP = 1;

export const LAST_ORDER_FLOW_STEP = 3;

export const ORDER_FLOW_STEP_COUNT = ORDER_FLOW_STEPS.length;

export const resolveOrderFlowStep = (step: number | undefined): OrderFlowStep =>
  ORDER_FLOW_STEPS.find((candidate) => candidate === step) ?? FIRST_ORDER_FLOW_STEP;

export const buildOrderFlowStepParam = (step: OrderFlowStep): number | undefined =>
  step === FIRST_ORDER_FLOW_STEP ? undefined : step;

export const deriveNextOrderFlowStep = (step: OrderFlowStep): OrderFlowStep | null =>
  ORDER_FLOW_STEPS.find((candidate) => candidate === step + 1) ?? null;

export const derivePreviousOrderFlowStep = (step: OrderFlowStep): OrderFlowStep | null =>
  ORDER_FLOW_STEPS.find((candidate) => candidate === step - 1) ?? null;
