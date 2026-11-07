import { EJ_CARDS_LIST, EJ_PAGE_LABEL } from '@furria/studio/edit-jobs-copy';
import { JobPhoneCard } from '@furria/studio/JobPhoneCard';
import { JobPhoneDrawers } from '@furria/studio/JobPhoneDrawers';
import { JobPhoneEmpty } from '@furria/studio/JobPhoneEmpty';
import { JobPhoneHead } from '@furria/studio/JobPhoneHead';
import { JobPhoneTools } from '@furria/studio/JobPhoneTools';
import { JobPhoneTransport } from '@furria/studio/JobPhoneTransport';
import { JobSwitch } from '@furria/studio/JobSwitch';
import { StudioSetupInputs } from '@furria/studio/StudioSetupInputs';
import { studioBandOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useJobPhone } from '@furria/studio/use-job-phone';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import { KkStudioView } from '@furria/ui/KkStudioView';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';

interface JobPhoneViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  versions: ReactNode;
  title: string;
}

export const JobPhoneView: FC<JobPhoneViewProps> = ({ screen, editor, versions, title }) => {
  const ej = useJobPhone(screen, editor);
  const bandText = studioBandOf(screen.evening, screen.mode.editing);
  const band = bandText === null ? null : <KkStudioView.BandNote text={bandText} />;
  const tools = ej.jobs.job === 'steps' ? null : <JobPhoneTools ej={ej} />;
  const views = ej.cards.cards.map((card) => <JobPhoneCard key={card.key} ej={ej} card={card} />);
  const body =
    views.length === 0 ? (
      <JobPhoneEmpty screen={screen} steps={ej.stepsView} />
    ) : (
      <KkLaneCards label={EJ_CARDS_LIST} index={ej.cards.index} onIndex={ej.cards.choose}>
        {views}
      </KkLaneCards>
    );

  return (
    <KkLanePhone label={EJ_PAGE_LABEL}>
      <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
      <KkLanePhone.Area area="head">
        <JobPhoneHead ej={ej} title={title} />
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">{body}</KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <Stack sx={{ gap: 0.75, minWidth: 0 }}>
          <Stack sx={{ gap: 0.75, minWidth: 0, px: 1 }}>
            {tools}
            <JobSwitch jobs={ej.jobs} />
          </Stack>
          <JobPhoneTransport screen={screen} />
        </Stack>
      </KkLanePhone.Area>
      <JobPhoneDrawers ej={ej} versions={versions} />
      <StudioSetupInputs setup={ej.setup} />
    </KkLanePhone>
  );
};
