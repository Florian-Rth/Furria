import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { KkImageSource } from './image-source';
import type { KkGroupTone } from './internal/group-tone';
import { lineClamp } from './internal/line-clamp';
import type { KkIconName } from './KkIcon';
import { hairRule } from './KkStartTile/internal/tile-paint';
import { KkStartTileThumb } from './KkStartTile/internal/ui/KkStartTileThumb';
import { kkTokens } from './tokens';

const rowPaint = (theme: Theme): CSSObject => ({
  gap: 1,
  py: 1.5,
  minWidth: 0,
  '&:not(:first-of-type)': {
    borderTopWidth: kkTokens.line.hair,
    borderTopStyle: 'solid',
    ...hairRule(theme),
  },
});

const HEAD_FRAME: CSSObject = { alignItems: 'center', gap: 1.25, minWidth: 0 };
const TITLE_PAINT: CSSObject = { ...lineClamp(2), fontWeight: 800, lineHeight: 1.25 };
const WHEN_PAINT: CSSObject = { color: 'text.secondary', fontWeight: 600 };

interface KkAnswerRowProps extends PropsWithChildren {
  title: string;
  when: string;
  image: KkImageSource | null;
  tone: KkGroupTone;
  icon: KkIconName;
}

export const KkAnswerRow: FC<KkAnswerRowProps> = ({ title, when, image, tone, icon, children }) => {
  return (
    <Stack component="li" data-kk-answer-row sx={rowPaint}>
      <Stack direction="row" sx={HEAD_FRAME}>
        <KkStartTileThumb image={image} tone={tone} icon={icon} alt={title} size="small" />
        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="span" variant="body2" sx={TITLE_PAINT}>
            {title}
          </Typography>
          <Typography component="span" variant="caption" sx={WHEN_PAINT}>
            {when}
          </Typography>
        </Stack>
      </Stack>
      {children}
    </Stack>
  );
};
