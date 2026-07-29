import type { FC } from 'react';
import type { KompassResultView } from '../logic/kompass-result';
import { KompassRanking } from './KompassRanking';
import { KompassResultEmpty } from './KompassResultEmpty';
import { KompassResultUnanswered } from './KompassResultUnanswered';

interface KompassResultBodyProps {
  view: KompassResultView;
  summary: string;
}

export const KompassResultBody: FC<KompassResultBodyProps> = ({ view, summary }) => {
  if (view.kind === 'unanswered') {
    return <KompassResultUnanswered summary={summary} />;
  }

  if (view.kind === 'empty') {
    return <KompassResultEmpty excluded={view.excluded} />;
  }

  return <KompassRanking view={view} summary={summary} />;
};
