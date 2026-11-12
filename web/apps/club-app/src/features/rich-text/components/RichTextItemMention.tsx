import { KkMention } from '@furria/ui/KkMention';
import { KkMentionCard } from '@furria/ui/KkMentionCard';
import type { FC, ReactNode } from 'react';

const PLAIN_FACE = { kind: 'plain' } as const;

interface RichTextItemMentionProps {
  label: string;
  name: string;
  line: string;
  action: ReactNode;
}

export const RichTextItemMention: FC<RichTextItemMentionProps> = ({
  label,
  name,
  line,
  action,
}) => (
  <KkMention label={label} tone={null}>
    <KkMentionCard face={PLAIN_FACE} name={name} line={line} action={action} />
  </KkMention>
);
