import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { SYSTEM_AREA_HELP, SYSTEM_HELP_SPOTS } from '../system-help-copy';
import type { SystemArea } from '../types';

interface SystemAreaHelpProps {
  area: SystemArea;
}

export const SystemAreaHelp: FC<SystemAreaHelpProps> = ({ area }) => {
  const hints = SYSTEM_AREA_HELP[area].map((hint) => {
    const texts = hint.texts.map((text) => <KkHelp.Text key={text}>{text}</KkHelp.Text>);
    const show = hint.showsSpot ? <ScreenHelpShow spot={SYSTEM_HELP_SPOTS.area} /> : null;

    return (
      <KkHelp.Hint key={hint.key}>
        <KkHelp.Title>{hint.title}</KkHelp.Title>
        {texts}
        {show}
      </KkHelp.Hint>
    );
  });

  return <ScreenHelp>{hints}</ScreenHelp>;
};
