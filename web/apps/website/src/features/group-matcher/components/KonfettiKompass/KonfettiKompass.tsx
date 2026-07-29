import { KkSection } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';
import {
  kompassIntro,
  kompassKicker,
  kompassSectionId,
  kompassTitle,
} from '@/features/group-matcher/kompass-content';
import { KompassPanel } from './internal/layout/KompassPanel';
import { useKompassSource } from './internal/logic/use-kompass-source';
import { KompassBody } from './internal/ui/KompassBody';

export const KonfettiKompass: FC = () => {
  const source = useKompassSource();

  return (
    <KkSection
      id={kompassSectionId}
      sx={{ scrollMarginTop: `calc(var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px) + 1rem)` }}
    >
      <KkSection.Header kicker={kompassKicker} title={kompassTitle} />
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '48rem' }}
      >
        {kompassIntro}
      </Typography>
      <KompassPanel>
        <KompassBody source={source} />
      </KompassPanel>
    </KkSection>
  );
};
