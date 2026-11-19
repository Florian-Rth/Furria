import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { INTAKE_EYEBROW, toIntakeHeaderMeta, toIntakeName } from '../intake-labels';
import type { IntakeSummary } from '../schemas';
import { IntakeStateChip } from './IntakeStateChip';

const PLACEHOLDER_INITIALS = '?';

interface IntakeHeaderProps {
  intake: IntakeSummary;
}

export const IntakeHeader: FC<IntakeHeaderProps> = ({ intake }) => {
  const initials =
    intake.newcomer === null
      ? PLACEHOLDER_INITIALS
      : toInitials(intake.newcomer.firstName, intake.newcomer.lastName);
  const name = toIntakeName(intake);
  const meta = toIntakeHeaderMeta(intake, new Date());

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkAvatar initials={initials} size="large" />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{INTAKE_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{name}</KkScreenHeader.Title>
        <KkScreenHeader.Meta>
          <IntakeStateChip state={intake.state} />
          <KkMeta>{meta}</KkMeta>
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
