import { KkEjStageHint } from '@furria/ui/KkEjStageHint';
import { KkEjToolBar } from '@furria/ui/KkEjToolBar';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { reasonsOf } from '../edit-jobs';
import { EJ_BAR_LABEL, EJ_JOB_GLYPH, reasonLineOf } from '../edit-jobs-copy';
import type { EjPhone } from '../hooks/use-ej-phone';

interface EjPhoneToolsProps {
  ej: EjPhone;
}

export const EjPhoneTools: FC<EjPhoneToolsProps> = ({ ej }) => {
  const tools = ej.bar.map((action) => (
    <KkEjToolBar.Tool
      key={action.key}
      text={action.text}
      glyph={action.glyph}
      tone={action.tone}
      label={action.label}
      pressed={action.pressed}
      disabled={action.disabled}
      onPress={action.press}
    />
  ));

  const line = reasonLineOf(reasonsOf(ej.bar)) ?? ej.view.context;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkEjStageHint glyph={EJ_JOB_GLYPH[ej.jobs.job]} text={line} wraps />
      <KkEjToolBar label={EJ_BAR_LABEL}>{tools}</KkEjToolBar>
    </Stack>
  );
};
