import type { FC, MouseEvent } from 'react';
import { KkIconButton } from '../../../KkIconButton';
import type { KkSx } from '../../../kk-sx';
import type { KkScreenAction } from '../../screen-declaration';
import { barMarkInset, barSlot } from '../logic/bar-slot';
import { useKkShell } from '../logic/shell-context';

const opensElsewhere = (event: MouseEvent<HTMLElement>): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

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
  const { link } = useKkShell();
  const loud = action.emphasis === true;
  const iconSize = loud ? 'small' : 'medium';
  const paint = loud ? loudPaint : quietPaint;
  const target = action.link;

  if (target === undefined) {
    return (
      <KkIconButton
        label={action.label}
        icon={action.icon}
        size={iconSize}
        onClick={action.onSelect}
        sx={paint}
      />
    );
  }

  const follow = (event: MouseEvent<HTMLElement>): void => {
    if (opensElsewhere(event)) {
      return;
    }
    event.preventDefault();
    action.onSelect();
  };

  return (
    <KkIconButton
      label={action.label}
      icon={action.icon}
      size={iconSize}
      component={link}
      to={target.to}
      params={target.params}
      search={target.search}
      onClick={follow}
      sx={paint}
    />
  );
};
