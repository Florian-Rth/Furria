import { describe, expect, it } from 'vitest';
import {
  BUYER_ORDER_FLOW_STEP,
  buildOrderFlowStepParam,
  derivePreviousOrderFlowStep,
  FIRST_ORDER_FLOW_STEP,
  ORDER_FLOW_STEPS,
  PAYMENT_ORDER_FLOW_STEP,
  resolveOrderFlowStep,
} from './order-flow-steps';

describe('resolveOrderFlowStep', () => {
  it('keeps the steps the flow actually has', () => {
    expect(resolveOrderFlowStep(1)).toBe(1);
    expect(resolveOrderFlowStep(2)).toBe(2);
    expect(resolveOrderFlowStep(3)).toBe(3);
  });

  it('falls back to the first step for anything the flow cannot walk', () => {
    expect(resolveOrderFlowStep(undefined)).toBe(1);
    expect(resolveOrderFlowStep(0)).toBe(1);
    expect(resolveOrderFlowStep(4)).toBe(1);
    expect(resolveOrderFlowStep(2.5)).toBe(1);
    expect(resolveOrderFlowStep(-2)).toBe(1);
  });
});

describe('buildOrderFlowStepParam', () => {
  it('writes no param for the entry step so leaving the flow stays one back', () => {
    expect(buildOrderFlowStepParam(1)).toBeUndefined();
  });

  it('writes the step number for every later step', () => {
    expect(buildOrderFlowStepParam(2)).toBe(2);
    expect(buildOrderFlowStepParam(3)).toBe(3);
  });

  it('round-trips every step through the URL', () => {
    for (const step of ORDER_FLOW_STEPS) {
      expect(resolveOrderFlowStep(buildOrderFlowStepParam(step))).toBe(step);
    }
  });
});

describe('named steps of the flow', () => {
  it('names the step each part of the flow belongs to', () => {
    expect(FIRST_ORDER_FLOW_STEP).toBe(1);
    expect(BUYER_ORDER_FLOW_STEP).toBe(2);
    expect(PAYMENT_ORDER_FLOW_STEP).toBe(3);
  });

  it('names only steps the flow can actually walk', () => {
    for (const step of [FIRST_ORDER_FLOW_STEP, BUYER_ORDER_FLOW_STEP, PAYMENT_ORDER_FLOW_STEP]) {
      expect(resolveOrderFlowStep(step)).toBe(step);
    }
  });
});

describe('derivePreviousOrderFlowStep', () => {
  it('walks back and stops at the first step', () => {
    expect(derivePreviousOrderFlowStep(3)).toBe(2);
    expect(derivePreviousOrderFlowStep(2)).toBe(1);
    expect(derivePreviousOrderFlowStep(1)).toBeNull();
  });
});
