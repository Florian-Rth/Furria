import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';

const SHOW_LABEL = 'Zeigen';

interface ScreenHelpShowProps {
  spot: string;
}

export const ScreenHelpShow: FC<ScreenHelpShowProps> = ({ spot }) => (
  <KkHelp.Show spot={spot} label={SHOW_LABEL} />
);
