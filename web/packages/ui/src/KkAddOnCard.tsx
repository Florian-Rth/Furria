import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkIconButton } from './KkIconButton';
import { KkMeta } from './KkMeta';
import { KkPanel } from './KkPanel';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkAddOnCardProps extends PropsWithChildren {
  icon: KkIconName;
  title: string;
  meta?: string;
  removeLabel: string;
  onRemove: () => void;
  sx?: KkSx;
}

export const KkAddOnCard: FC<KkAddOnCardProps> = ({
  icon,
  title,
  meta,
  removeLabel,
  onRemove,
  sx,
  children,
}) => {
  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

  return (
    <KkPanel
      variant="block"
      tone="raised"
      sx={[{ gap: kkTokens.form.fieldGap }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack
        data-kk-add-on-card
        direction="row"
        sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}
      >
        <KkIcon name={icon} size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
        <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.25 }}>
          <Typography
            component="h3"
            sx={{
              typography: 'h4',
              letterSpacing: kkTokens.type.tracking.display,
              lineHeight: 1.3,
              m: 0,
            }}
          >
            {title}
          </Typography>
          {metaLine}
        </Stack>
        <KkIconButton label={removeLabel} icon="close" size="small" onClick={onRemove} />
      </Stack>
      {children}
    </KkPanel>
  );
};
