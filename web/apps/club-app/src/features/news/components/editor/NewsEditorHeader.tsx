import { KkChip, KkEyebrow, KkMeta, KkScreenHeader } from '@furria/ui';
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
