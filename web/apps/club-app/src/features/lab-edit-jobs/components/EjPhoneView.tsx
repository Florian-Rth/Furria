import { StudioSetupInputs } from '@furria/studio/StudioSetupInputs';
import { studioBandOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import { KkStudioView } from '@furria/ui/KkStudioView';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { EJ_CARDS_LIST, EJ_PAGE_LABEL } from '../edit-jobs-copy';
import { useEjPhone } from '../hooks/use-ej-phone';
import type { EjVersions } from '../hooks/use-ej-versions';
import { EjJobSwitch } from './EjJobSwitch';
import { EjPhoneCard } from './EjPhoneCard';
import { EjPhoneDrawers } from './EjPhoneDrawers';
import { EjPhoneEmpty } from './EjPhoneEmpty';
import { EjPhoneHead } from './EjPhoneHead';
import { EjPhoneTools } from './EjPhoneTools';
import { EjPhoneTransport } from './EjPhoneTransport';

interface EjPhoneViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  versions: EjVersions;
  title: string;
}

export const EjPhoneView: FC<EjPhoneViewProps> = ({ screen, editor, versions, title }) => {
  const ej = useEjPhone(screen, editor);
  const bandText = studioBandOf(screen.evening, screen.mode.editing);
  const band = bandText === null ? null : <KkStudioView.BandNote text={bandText} />;
  const tools = ej.jobs.job === 'steps' ? null : <EjPhoneTools ej={ej} />;
  const views = ej.cards.cards.map((card) => <EjPhoneCard key={card.key} ej={ej} card={card} />);
  const body =
    views.length === 0 ? (
      <EjPhoneEmpty screen={screen} steps={ej.stepsView} />
    ) : (
      <KkLaneCards label={EJ_CARDS_LIST} index={ej.cards.index} onIndex={ej.cards.choose}>
        {views}
      </KkLaneCards>
    );

  return (
    <KkLanePhone label={EJ_PAGE_LABEL}>
      <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
      <KkLanePhone.Area area="head">
        <EjPhoneHead ej={ej} title={title} />
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">{body}</KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <Stack sx={{ gap: 0.75, minWidth: 0 }}>
          <Stack sx={{ gap: 0.75, minWidth: 0, px: 1 }}>
            {tools}
            <EjJobSwitch jobs={ej.jobs} />
          </Stack>
          <EjPhoneTransport screen={screen} />
        </Stack>
      </KkLanePhone.Area>
      <EjPhoneDrawers ej={ej} versions={versions} />
      <StudioSetupInputs setup={ej.setup} />
    </KkLanePhone>
  );
};
