import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkInstallStage } from '@furria/ui/KkInstallStage';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkTwoToneHeadline } from '@furria/ui/KkTwoToneHeadline';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';
import { CLUB_LABEL } from '@/features/app-install/install-copy';
import {
  PUSH_ASK_EYEBROW,
  PUSH_ASK_HEADLINE,
  PUSH_ASK_LATER_NOTE,
  PUSH_ASK_NEXT,
} from '../push-copy';
import { PushDeviceSwitch } from './PushDeviceSwitch';

const OVER_THE_APP: KkSx = (theme) => ({
  position: 'fixed',
  inset: 0,
  zIndex: theme.zIndex.modal + 1,
  overflowY: 'auto',
});

interface PushAskScreenProps {
  onNext: () => void;
}

export const PushAskScreen: FC<PushAskScreenProps> = ({ onNext }) => (
  <KkInstallStage sx={OVER_THE_APP}>
    <KkInstallStage.Meta>
      <KkEyebrow tone="muted">{CLUB_LABEL}</KkEyebrow>
      <KkEyebrow tone="muted">{PUSH_ASK_EYEBROW}</KkEyebrow>
    </KkInstallStage.Meta>
    <KkInstallStage.Head>
      <KkInstallStage.Copy>
        <KkTwoToneHeadline
          line1={PUSH_ASK_HEADLINE.line1}
          line2={PUSH_ASK_HEADLINE.line2}
          variant="display"
          posterShadow
        />
      </KkInstallStage.Copy>
    </KkInstallStage.Head>
    <KkPanel variant="block">
      <PushDeviceSwitch />
    </KkPanel>
    <KkNote>{PUSH_ASK_LATER_NOTE}</KkNote>
    <KkInstallStage.Actions>
      <KkButton variant="contained" size="large" fullWidth onClick={onNext}>
        {PUSH_ASK_NEXT}
      </KkButton>
    </KkInstallStage.Actions>
  </KkInstallStage>
);
