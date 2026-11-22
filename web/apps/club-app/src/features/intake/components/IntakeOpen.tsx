import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHeading } from '@furria/ui/KkHeading';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { OpenIntakePage } from '../hooks/use-intake-page';
import { useNewcomerForm } from '../hooks/use-newcomer-form';
import { PAGE_TITLE, SUBMIT_LABEL } from '../intake-copy';
import { IntakeAboutFields } from './IntakeAboutFields';
import { IntakeAddressFields } from './IntakeAddressFields';
import { IntakeClubGroupField } from './IntakeClubGroupField';
import { IntakeContactFields } from './IntakeContactFields';
import { IntakePortraitField } from './IntakePortraitField';

interface IntakeOpenProps {
  page: OpenIntakePage;
}

export const IntakeOpen: FC<IntakeOpenProps> = ({ page }) => {
  const control = useNewcomerForm(page);
  const { intake } = page;
  const clubLine =
    intake.clubName === null ? null : <KkEyebrow tone="muted">{intake.clubName}</KkEyebrow>;
  const address = intake.addressRequired ? <IntakeAddressFields form={control.form} /> : null;
  const rejection = control.rejection === null ? null : <KkAlert>{control.rejection}</KkAlert>;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 0.5 }}>
        {clubLine}
        <KkHeading level={1} component="h1">
          {PAGE_TITLE}
        </KkHeading>
      </Stack>
      <Stack component="form" noValidate onSubmit={control.submit} sx={{ gap: 2.5 }}>
        <IntakeAboutFields form={control.form} />
        {address}
        <IntakeContactFields form={control.form} />
        <IntakeClubGroupField form={control.form} />
        <IntakePortraitField portrait={control.portrait} uploadShare={control.uploadShare} />
        {rejection}
        <KkButton type="submit" fullWidth loading={control.isSending} disabled={!control.canSubmit}>
          {SUBMIT_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};
