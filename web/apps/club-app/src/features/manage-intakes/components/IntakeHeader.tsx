import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import {
  INTAKE_EYEBROW,
  toIntakeHeaderMeta,
  toIntakeInitials,
  toIntakeName,
} from '../intake-labels';
import type { IntakeSummary } from '../schemas';
import { IntakeStateChip } from './IntakeStateChip';

interface IntakeHeaderProps {
  intake: IntakeSummary;
}

export const IntakeHeader: FC<IntakeHeaderProps> = ({ intake }) => {
  const initials = toIntakeInitials(intake);
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
