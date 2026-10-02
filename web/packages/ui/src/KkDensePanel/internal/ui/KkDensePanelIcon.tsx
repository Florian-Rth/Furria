import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

type KkDensePanelIconTone = 'muted' | 'info';

const iconInks: Record<KkDensePanelIconTone, (theme: Theme) => CSSObject> = {
  muted: () => ({ color: 'text.secondary' }),
  info: (theme) =>
    applyScheme(theme, schemeInk(kkTokens.color.light.blueInk, kkTokens.color.dark.blueInk)),
};

interface KkDensePanelIconProps {
  name: KkIconName;
  tone?: KkDensePanelIconTone;
}

export const KkDensePanelIcon: FC<KkDensePanelIconProps> = ({ name, tone = 'muted' }) => (
  <Stack component="span" data-kk-dense-icon sx={iconInks[tone]}>
    <KkIcon name={name} size="small" />
  </Stack>
);
