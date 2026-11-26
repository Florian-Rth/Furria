import type { KkScreenHelp } from '@furria/ui/screen-declaration';
import type { ReactNode } from 'react';

const HELP_LABEL = 'Hilfe';

export const toScreenHelp = (sheet: ReactNode): KkScreenHelp => ({ label: HELP_LABEL, sheet });
