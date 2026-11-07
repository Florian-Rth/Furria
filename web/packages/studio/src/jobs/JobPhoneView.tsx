import { JobPhoneCard } from '@furria/studio/JobPhoneCard';
import { JobPhoneDrawers } from '@furria/studio/JobPhoneDrawers';
import { JobPhoneEmpty } from '@furria/studio/JobPhoneEmpty';
import { JobPhoneHead } from '@furria/studio/JobPhoneHead';
import { JobPhoneTools } from '@furria/studio/JobPhoneTools';
import { JobPhoneTransport } from '@furria/studio/JobPhoneTransport';
import { JobSwitch } from '@furria/studio/JobSwitch';
import { JOB_CARDS_LIST, JOB_PAGE_LABEL } from '@furria/studio/job-copy';
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
  const jobPhone = useJobPhone(screen, editor);
  const bandText = studioBandOf(screen.evening, screen.mode.editing);
  const band = bandText === null ? null : <KkStudioView.BandNote text={bandText} />;
  const tools = jobPhone.jobs.job === 'steps' ? null : <JobPhoneTools jobPhone={jobPhone} />;
  const views = jobPhone.cards.cards.map((card) => (
    <JobPhoneCard key={card.key} jobPhone={jobPhone} card={card} />
  ));
  const body =
    views.length === 0 ? (
      <JobPhoneEmpty screen={screen} steps={jobPhone.stepsView} />
    ) : (
      <KkLaneCards
        label={JOB_CARDS_LIST}
        index={jobPhone.cards.index}
        onIndex={jobPhone.cards.choose}
      >
        {views}
      </KkLaneCards>
    );

  return (
    <KkLanePhone label={JOB_PAGE_LABEL}>
      <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
      <KkLanePhone.Area area="head">
        <JobPhoneHead jobPhone={jobPhone} title={title} />
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">{body}</KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <Stack sx={{ gap: 0.75, minWidth: 0 }}>
          <Stack sx={{ gap: 0.75, minWidth: 0, px: 1 }}>
            {tools}
            <JobSwitch jobs={jobPhone.jobs} />
          </Stack>
          <JobPhoneTransport screen={screen} />
        </Stack>
      </KkLanePhone.Area>
      <JobPhoneDrawers jobPhone={jobPhone} versions={versions} />
      <StudioSetupInputs setup={jobPhone.setup} />
    </KkLanePhone>
  );
};
