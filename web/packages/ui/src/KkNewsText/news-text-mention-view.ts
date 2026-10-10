import type { FC } from 'react';
import type { NewsMention } from '../news-text/news-text-model';

export interface KkNewsTextMentionProps {
  mention: NewsMention;
}

export type KkNewsTextMentionView = FC<KkNewsTextMentionProps>;
