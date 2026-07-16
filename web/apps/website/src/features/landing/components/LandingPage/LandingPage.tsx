import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useLandingContent } from '../../hooks/use-landing-content';
import { TeaserLayout } from './internal/TeaserLayout';
import { TwoToneHeadline } from './internal/TwoToneHeadline';
import { Wordmark } from './internal/Wordmark';

export const LandingPage: FC = () => {
  const content = useLandingContent();

  return (
    <TeaserLayout>
      <TeaserLayout.Masthead>
        <Wordmark text={content.wordmark} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {content.mastheadMeta}
        </Typography>
      </TeaserLayout.Masthead>
      <TeaserLayout.Hero>
        <TwoToneHeadline line1={content.headlineLine1} line2={content.headlineLine2} />
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm' }}>
          {content.tagline}
        </Typography>
        <Button variant="contained" color="primary" size="large">
          {content.ctaLabel}
        </Button>
      </TeaserLayout.Hero>
    </TeaserLayout>
  );
};
