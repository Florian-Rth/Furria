import type { FC } from 'react';
import { KkIconButton } from '../../../KkIconButton';
import type { KkSx } from '../../../kk-sx';
import type { KkScreenAction } from '../../screen-declaration';
import { barMarkInset, barSlot } from '../logic/bar-slot';

const quietPaint: KkSx = [barSlot, { color: 'text.secondary' }];

const loudPaint: KkSx = [
  barSlot,
  {
    isolation: 'isolate',
    color: 'primary.contrastText',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: barMarkInset,
      zIndex: -1,
      borderRadius: '50%',
      backgroundColor: 'primary.main',
    },
    '@media (hover: hover)': {
      '&:hover': { backgroundColor: 'transparent' },
      '&:hover::before': { backgroundColor: 'primary.dark' },
    },
  },
];

interface KkShellBarActionProps {
  action: KkScreenAction;
}

export const KkShellBarAction: FC<KkShellBarActionProps> = ({ action }) => {
  const loud = action.emphasis === true;
  const iconSize = loud ? 'small' : 'medium';
  const paint = loud ? loudPaint : quietPaint;

  return (
    <KkIconButton
      label={action.label}
      icon={action.icon}
      size={iconSize}
      onClick={action.onSelect}
      sx={paint}
    />
  );
};
