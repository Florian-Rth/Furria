import type { FC } from 'react';
import type { TextMention } from '../rich-text/rich-text-model';

export interface KkRichTextMentionProps {
  mention: TextMention;
}

export type KkRichTextMentionView = FC<KkRichTextMentionProps>;
