import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkSeverity } from './KkSeverityGlyph';
import { KkSeverityGlyph } from './KkSeverityGlyph';
import { kkTokens } from './tokens';

interface KkFindingLineProps {
  severity: KkSeverity;
  title: string;
  text: string;
  action?: ReactNode;
  actionAt?: 'below' | 'end';
}

export const KkFindingLine: FC<KkFindingLineProps> = ({
  severity,
  title,
  text,
  action,
  actionAt = 'below',
}) => {
  const hasAction = action !== undefined && action !== null;
  const endSlot =
    hasAction && actionAt === 'end' ? (
      <Box component="span" sx={{ flexShrink: 0, alignSelf: 'center' }}>
        {action}
      </Box>
    ) : null;
  const actionSlot =
    !hasAction || actionAt === 'end' ? null : (
      <Box component="span" sx={{ alignSelf: 'flex-start', maxWidth: '100%', pt: 0.75 }}>
        {action}
      </Box>
    );

  return (
    <Stack
      direction="row"
      data-kk-finding-line={severity}
      sx={{
        gap: 1,
        py: 1,
        minWidth: 0,
        alignItems: 'flex-start',
        '& + &': {
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderTopColor: 'divider',
        },
      }}
    >
      <Box component="span" sx={{ pt: 0.25 }}>
        <KkSeverityGlyph state={severity} size="medium" />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="span"
          sx={{ typography: 'body2', fontWeight: 800, lineHeight: 1.3, color: 'text.primary' }}
        >
          {title}
        </Box>
        <Box
          component="span"
          sx={{ typography: 'caption', fontWeight: 600, lineHeight: 1.35, color: 'text.secondary' }}
        >
          {text}
        </Box>
        {actionSlot}
      </Stack>
      {endSlot}
    </Stack>
  );
};
