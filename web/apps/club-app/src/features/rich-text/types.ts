import type { KkGroupTone } from '@furria/ui/group-tone';
import type { KkImageSource } from '@furria/ui/image-source';
import type { KkMentionSection } from '@furria/ui/KkMentionPicker';
import type { MentionKind } from '@furria/ui/rich-text';

export interface Mentionable {
  kind: MentionKind;
  id: string;
  targetId: number;
  name: string;
  line: string;
  tone: KkGroupTone | null;
  initials: string;
  image: KkImageSource | null;
  isOffered: boolean;
}

export interface MentionablesSource {
  list: readonly Mentionable[];
  emptyLabel: string;
  sectionsOf: (choices: readonly Mentionable[]) => KkMentionSection[];
  missingTargetNote: string;
}
