import { KkConfettiRain } from '@furria/ui';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { TeaserLayout } from './internal/TeaserLayout';
import { TwoToneHeadline } from './internal/TwoToneHeadline';
import { Wordmark } from './internal/Wordmark';

interface LandingPageProps {
  onCtaClick: () => void;
  confettiPaused?: boolean;
}

export const LandingPage: FC<LandingPageProps> = ({ onCtaClick, confettiPaused = false }) => (
  <TeaserLayout>
    <TeaserLayout.Masthead>
      <Wordmark text="FURRIA" />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Furrscher Carnevals Club e.V. · Großbesenstadt · seit 1971
      </Typography>
    </TeaserLayout.Masthead>
    <TeaserLayout.Hero>
      <KkConfettiRain paused={confettiPaused} />
      <TwoToneHeadline line1="DIE FÜNFTE JAHRESZEIT" line2="BEGINNT HIER." />
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm' }}>
        Der Furrsche Carnevals Club baut hier sein neues Zuhause. Bald findet ihr Programm, Tickets
        und Neuigkeiten an dieser Stelle.
      </Typography>
      <Button variant="contained" color="primary" size="large" onClick={onCtaClick}>
        Einlass
      </Button>
    </TeaserLayout.Hero>
  </TeaserLayout>
);
