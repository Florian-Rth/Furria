import Stack from '@mui/material/Stack';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { useState } from 'react';
import { LegalLinks } from '@/components/LegalLinks';
import { SiteChrome } from '@/components/SiteChrome';
import { LandingPage } from '@/features/landing';
import { PreviewAccessDialog, PreviewTeaser, usePreviewAccess } from '@/features/preview-access';
import type { RouteHead } from '@/lib/seo';

const HOME_TITLE = 'FURRIA · Gross - Furria!';
const HOME_DESCRIPTION =
  'Der Furrsche Carnevals Club e.V. feiert die fünfte Jahreszeit in Großfurra: Programm, Tickets, Neuigkeiten und der Weg in den Verein. Gross - Furria!';

const HomeComponent: FC = () => {
  const { granted } = usePreviewAccess();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (granted) {
    return (
      <SiteChrome>
        <LandingPage />
      </SiteChrome>
    );
  }

  return (
    <>
      <Stack
        sx={{
          minHeight: '100dvh',
          filter: dialogOpen ? 'blur(9px)' : 'none',
        }}
      >
        <PreviewTeaser onCtaClick={() => setDialogOpen(true)} confettiPaused={dialogOpen} />
        <Stack
          component="footer"
          direction="row"
          sx={{
            justifyContent: 'center',
            py: 2.5,
            px: 2,
            borderTop: 1,
            borderColor: 'divider',
            color: 'text.secondary',
          }}
        >
          <LegalLinks />
        </Stack>
      </Stack>
      <PreviewAccessDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export const Route = createFileRoute('/')({
  head: (): RouteHead => ({
    meta: [
      { title: HOME_TITLE },
      { name: 'description', content: HOME_DESCRIPTION },
      { property: 'og:title', content: HOME_TITLE },
      { property: 'og:description', content: HOME_DESCRIPTION },
    ],
  }),
  component: HomeComponent,
});
