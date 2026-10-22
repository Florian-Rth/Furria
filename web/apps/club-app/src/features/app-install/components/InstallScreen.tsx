import { KkAppTile } from '@furria/ui/KkAppTile';
import { KkConfettiBurst } from '@furria/ui/KkConfettiBurst';
import { KkDiagonalStamp } from '@furria/ui/KkDiagonalStamp';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkInstallStage } from '@furria/ui/KkInstallStage';
import { KkNote } from '@furria/ui/KkNote';
import { KkTwoToneHeadline } from '@furria/ui/KkTwoToneHeadline';
import type { FC } from 'react';
import { useInstallScreen } from '../hooks/use-install-screen';
import { CELEBRATION_CALL, CLUB_LABEL, SECRET_TILE_LABEL } from '../install-copy';
import { InstallDoneBody } from './InstallDoneBody';
import { InstallGuideBody } from './InstallGuideBody';

const BURST_COUNT = 36;

export const InstallScreen: FC = () => {
  const { flow, secret, headline, lead, facts, targetLabel, celebrationKey, exitHref } =
    useInstallScreen();
  const leadLine = lead === null ? null : <KkNote>{lead}</KkNote>;
  const factLine = facts === null ? null : <KkEyebrow>{facts}</KkEyebrow>;
  const body =
    flow.phase === 'guide' ? (
      <InstallGuideBody
        guide={flow.guide}
        exitHref={exitHref}
        onInstall={flow.install}
        onConfirmDone={flow.confirmDone}
      />
    ) : (
      <InstallDoneBody onReopenGuide={flow.reopenGuide} />
    );

  return (
    <KkInstallStage>
      <KkInstallStage.Meta>
        <KkEyebrow tone="muted">{CLUB_LABEL}</KkEyebrow>
        <KkEyebrow tone="muted">{targetLabel}</KkEyebrow>
      </KkInstallStage.Meta>
      <KkInstallStage.Head>
        <KkAppTile
          label={SECRET_TILE_LABEL}
          charge={secret.charge}
          tapKey={secret.tapKey}
          onPress={secret.tap}
        />
        <KkInstallStage.Copy>
          <KkTwoToneHeadline
            line1={headline.line1}
            line2={headline.line2}
            variant="display"
            posterShadow
          />
          {factLine}
        </KkInstallStage.Copy>
      </KkInstallStage.Head>
      {leadLine}
      {body}
      <KkConfettiBurst fireKey={celebrationKey} count={BURST_COUNT} alwaysPlays />
      <KkDiagonalStamp label={CELEBRATION_CALL} fireKey={celebrationKey} />
    </KkInstallStage>
  );
};
