import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkQrCode } from '@furria/ui/KkQrCode';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { IntakeShare } from '../hooks/use-intake-share';
import { INTAKE_HELP_SPOTS } from '../intake-help-copy';
import { LINK_SECTION, toExpiryLine, toQrLabel } from '../intake-labels';
import type { IntakeSummary } from '../schemas';

const LINK_STACK_SX = { gap: 2, alignItems: 'center', minWidth: 0 } as const;

interface IntakeLinkPanelProps {
  intake: IntakeSummary;
  share: IntakeShare;
}

export const IntakeLinkPanel: FC<IntakeLinkPanelProps> = ({ intake, share }) => {
  const qrLabel = toQrLabel(intake);
  const expiryLine = toExpiryLine(intake.expiresAt, new Date());

  return (
    <KkPanelSection title={LINK_SECTION} landing={INTAKE_HELP_SPOTS.link}>
      <KkPanel variant="block">
        <Stack sx={LINK_STACK_SX}>
          <KkQrCode value={share.url} label={qrLabel} />
          <KkNote tone="muted">{expiryLine}</KkNote>
        </Stack>
      </KkPanel>
    </KkPanelSection>
  );
};
