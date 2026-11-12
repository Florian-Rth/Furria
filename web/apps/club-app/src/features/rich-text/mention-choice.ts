import type { KkMentionChoice } from '@furria/ui/KkMentionOption';
import type { Mentionable } from './types';

export const mentionChoiceOf = (mentionable: Mentionable): KkMentionChoice => ({
  id: mentionable.id,
  kind: mentionable.kind === 'person' ? 'person' : 'group',
  name: mentionable.name,
  line: mentionable.line,
  initials: mentionable.initials,
  tone: mentionable.tone,
  image: mentionable.image,
});
