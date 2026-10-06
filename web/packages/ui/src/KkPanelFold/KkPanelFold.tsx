import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { useId, useState } from 'react';
import { rowDividerTop } from '../internal/row-divider';
import { useReducedMotion } from '../internal/use-reduced-motion';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkPanelFoldToggle } from './internal/ui/KkPanelFoldToggle';

const INSTANT = 0;

interface KkPanelFoldProps extends PropsWithChildren {
  label: string;
  flag?: string;
  sx?: KkSx;
}

export const KkPanelFold: FC<KkPanelFoldProps> = ({ label, flag, sx, children }) => {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const reducedMotion = useReducedMotion();
  const collapseTimeout = reducedMotion ? INSTANT : undefined;

  const toggle = (): void => {
    setExpanded((current) => !current);
  };

  return (
    <Stack
      data-kk-panel-fold
      sx={[{ minWidth: 0, ...rowDividerTop }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkPanelFoldToggle
        label={label}
        flag={flag}
        expanded={expanded}
        contentId={contentId}
        onToggle={toggle}
      />
      <Collapse in={expanded} timeout={collapseTimeout} unmountOnExit>
        <Stack
          id={contentId}
          sx={{
            minWidth: 0,
            borderTopWidth: kkTokens.line.hair,
            borderTopStyle: 'solid',
            borderColor: 'divider',
          }}
        >
          {children}
        </Stack>
      </Collapse>
    </Stack>
  );
};
