import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';

const TITLE_PAINT: CSSObject = {
  ...lineClamp(2),
  m: 0,
  letterSpacing: kkTokens.type.tracking.display,
  lineHeight: 1.1,
};

const CONTEXT_PAINT: CSSObject = { m: 0, color: 'text.secondary', fontWeight: 700 };

interface KkPassDetailsHeadProps {
  title: string;
  context: string;
  closeLabel: string;
  onClose?: () => void;
}

export const KkPassDetailsHead: FC<KkPassDetailsHeadProps> = ({
  title,
  context,
  closeLabel,
  onClose,
}) => {
  const close =
    onClose === undefined ? null : (
      <KkIconButton label={closeLabel} icon="close" size="small" onClick={onClose} />
    );

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Stack sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="h2" variant="h3" sx={TITLE_PAINT}>
          {title}
        </Typography>
        <Typography component="p" variant="caption" sx={CONTEXT_PAINT}>
          {context}
        </Typography>
      </Stack>
      {close}
    </Stack>
  );
};
