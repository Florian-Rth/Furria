import { describe, expect, it } from 'vitest';
import { plannerKeyCommandOf } from './planner-keys';

const input = (key: string, flags: { mod?: boolean; shift?: boolean; inField?: boolean } = {}) => ({
  key,
  mod: flags.mod ?? false,
  shift: flags.shift ?? false,
  inField: flags.inField ?? false,
});

describe('plannerKeyCommandOf', () => {
  it.each([
    { name: 'undo', at: input('z', { mod: true }), command: { kind: 'undo' } },
    {
      name: 'redo with shift',
      at: input('Z', { mod: true, shift: true }),
      command: { kind: 'redo' },
    },
    { name: 'redo with y', at: input('y', { mod: true }), command: { kind: 'redo' } },
    { name: 'duplicate', at: input('d', { mod: true }), command: { kind: 'duplicate' } },
    { name: 'group', at: input('g', { mod: true }), command: { kind: 'group' } },
    { name: 'ungroup', at: input('G', { mod: true, shift: true }), command: { kind: 'ungroup' } },
    { name: 'delete', at: input('Delete'), command: { kind: 'delete' } },
    { name: 'backspace', at: input('Backspace'), command: { kind: 'delete' } },
    {
      name: 'fine nudge',
      at: input('ArrowLeft'),
      command: { kind: 'nudge', delta: { x: -1, y: 0 } },
    },
    {
      name: 'coarse nudge',
      at: input('ArrowDown', { shift: true }),
      command: { kind: 'nudge', delta: { x: 0, y: 10 } },
    },
    { name: 'count up', at: input('+'), command: { kind: 'count', delta: 1 } },
    { name: 'count down', at: input('-'), command: { kind: 'count', delta: -1 } },
    { name: 'rotate right', at: input('r'), command: { kind: 'rotate', degrees: 15 } },
    {
      name: 'rotate left',
      at: input('R', { shift: true }),
      command: { kind: 'rotate', degrees: -15 },
    },
    { name: 'tool', at: input('3'), command: { kind: 'tool', tool: 'row' } },
    {
      name: 'escape in a field',
      at: input('Escape', { inField: true }),
      command: { kind: 'escape' },
    },
    { name: 'typing in a field', at: input('Delete', { inField: true }), command: null },
    { name: 'unknown key', at: input('q'), command: null },
    { name: 'unknown mod key', at: input('q', { mod: true }), command: null },
  ])('$name', ({ at, command }) => {
    expect(plannerKeyCommandOf(at)).toEqual(command);
  });
});
