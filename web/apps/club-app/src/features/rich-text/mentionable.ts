import { mentionKeyOf } from '@furria/ui/rich-text';
import type { Mentionable } from './types';

export const mentionableOf = (fields: Omit<Mentionable, 'id'>): Mentionable => ({
  ...fields,
  id: mentionKeyOf({ kind: fields.kind, id: fields.targetId }),
});
