import { KkChip } from '@furria/ui/KkChip';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { BYLINE_AUTHOR, EDITOR_EYEBROW } from '../../editor-copy';
import { STAGE_TONES, STAGE_WORDS } from '../../news-copy';
import type { NewsStage } from '../../types';

interface NewsEditorHeaderProps {
  title: string;
  stage: NewsStage;
  authorName: string | null;
}

export const NewsEditorHeader: FC<NewsEditorHeaderProps> = ({ title, stage, authorName }) => {
  const stageTone = STAGE_TONES[stage];
  const stageLabel = STAGE_WORDS[stage];
  const bylineText = `${BYLINE_AUTHOR} ${authorName ?? ''}`;
  const byline = authorName === null ? null : <KkMeta>{bylineText}</KkMeta>;

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{EDITOR_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{title}</KkScreenHeader.Title>
        <KkScreenHeader.Meta>
          <KkChip tone={stageTone} dot>
            {stageLabel}
          </KkChip>
          {byline}
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
