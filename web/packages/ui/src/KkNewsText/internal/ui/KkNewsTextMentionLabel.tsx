import type { FC } from 'react';
import type { KkNewsTextMentionProps } from '../../news-text-mention-view';

export const KkNewsTextMentionLabel: FC<KkNewsTextMentionProps> = ({ mention }) => mention.label;
