import { describe, expect, it } from 'vitest';
import { toPersonEditorGate } from './person-editor-gate';

describe('toPersonEditorGate', () => {
  it.each([
    {
      name: 'waits while permissions are undecided, even with the person loaded',
      input: {
        person: { personId: 7 },
        isUndecided: true,
        mayManage: false,
        isForbidden: false,
        isMissing: false,
        errorMessage: null,
      },
      expected: { kind: 'pending' },
    },
    {
      name: 'denies once permissions lack the key',
      input: {
        person: undefined,
        isUndecided: false,
        mayManage: false,
        isForbidden: false,
        isMissing: false,
        errorMessage: null,
      },
      expected: { kind: 'denied', person: undefined },
    },
    {
      name: 'denies when the server forbids the person',
      input: {
        person: undefined,
        isUndecided: false,
        mayManage: true,
        isForbidden: true,
        isMissing: false,
        errorMessage: null,
      },
      expected: { kind: 'denied', person: undefined },
    },
    {
      name: 'opens the editor once permitted and loaded',
      input: {
        person: { personId: 7 },
        isUndecided: false,
        mayManage: true,
        isForbidden: false,
        isMissing: false,
        errorMessage: null,
      },
      expected: { kind: 'ready', person: { personId: 7 } },
    },
    {
      name: 'reports a missing person',
      input: {
        person: undefined,
        isUndecided: false,
        mayManage: true,
        isForbidden: false,
        isMissing: true,
        errorMessage: null,
      },
      expected: { kind: 'missing' },
    },
    {
      name: 'reports a failed load',
      input: {
        person: undefined,
        isUndecided: false,
        mayManage: true,
        isForbidden: false,
        isMissing: false,
        errorMessage: 'offline',
      },
      expected: { kind: 'failed', message: 'offline' },
    },
    {
      name: 'waits while the person is still loading',
      input: {
        person: undefined,
        isUndecided: false,
        mayManage: true,
        isForbidden: false,
        isMissing: false,
        errorMessage: null,
      },
      expected: { kind: 'pending' },
    },
  ])('$name', ({ input, expected }) => {
    expect(toPersonEditorGate(input)).toEqual(expected);
  });
});
