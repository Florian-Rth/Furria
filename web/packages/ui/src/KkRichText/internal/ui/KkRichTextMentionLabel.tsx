import type { FC } from 'react';
import type { KkRichTextMentionProps } from '../../rich-text-mention-view';

export const KkRichTextMentionLabel: FC<KkRichTextMentionProps> = ({ mention }) => mention.label;
