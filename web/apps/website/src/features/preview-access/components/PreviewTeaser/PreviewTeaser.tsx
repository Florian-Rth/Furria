import { KkConfettiRain, KkTwoToneHeadline } from '@furria/ui';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { Teaser } from './Teaser';

interface PreviewTeaserProps {
  onCtaClick: () => void;
  confettiPaused?: boolean;
}

export const PreviewTeaser: FC<PreviewTeaserProps> = ({ onCtaClick, confettiPaused = false }) => (
  <Teaser>
    <Teaser.Masthead>
      <Teaser.Wordmark text="FURRIA" />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Furrscher Carnevals Club e.V.
      </Typography>
    </Teaser.Masthead>
    <Teaser.Stage>
      <KkConfettiRain paused={confettiPaused} />
      <KkTwoToneHeadline line1="DIE FÜNFTE JAHRESZEIT" line2="BEGINNT HIER." />
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm' }}>
        Der Furrsche Carnevals Club baut hier sein neues Zuhause. Bald findet ihr Programm, Tickets
        und Neuigkeiten an dieser Stelle.
      </Typography>
      <Button variant="contained" color="primary" size="large" onClick={onCtaClick}>
        Einlass
      </Button>
    </Teaser.Stage>
  </Teaser>
);
