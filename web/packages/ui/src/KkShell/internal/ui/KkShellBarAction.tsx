import type { FC } from 'react';
import { KkIconButton } from '../../../KkIconButton';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkScreenAction } from '../../screen-declaration';

const target: KkSx = { minWidth: kkTokens.tapTarget, minHeight: kkTokens.tapTarget };

const quietPaint: KkSx = [target, { color: 'text.secondary' }];

const loudPaint: KkSx = [
  target,
  {
    color: 'primary.contrastText',
    backgroundColor: 'primary.main',
    '@media (hover: hover)': {
      '&:hover': { backgroundColor: 'primary.dark' },
    },
  },
];

interface KkShellBarActionProps {
  action: KkScreenAction;
}

export const KkShellBarAction: FC<KkShellBarActionProps> = ({ action }) => (
  <KkIconButton
    label={action.label}
    icon={action.icon}
    onClick={action.onSelect}
    sx={action.emphasis === true ? loudPaint : quietPaint}
  />
);
