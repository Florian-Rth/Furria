import Stack from '@mui/material/Stack';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { useState } from 'react';
import { LegalLinks } from '@/components/LegalLinks';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { SiteChrome } from '@/components/SiteChrome';
import { LandingPage } from '@/features/landing';
import { PreviewAccessDialog, usePreviewAccess } from '@/features/preview-access';

// '/' branches on the preview grant: ungated visitors get the full-bleed
// coming-soon teaser with the unlock dialog (unlock lands on /apps); granted
// visitors see the home placeholder inside the branded chrome — the real
// landing page replaces it in P1.
const HomeComponent: FC = () => {
  const { granted } = usePreviewAccess();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (granted) {
    return (
      <SiteChrome>
        <PlaceholderPage title="Willkommen" />
      </SiteChrome>
    );
  }

  return (
    <>
      <Stack
        sx={{
          // Full viewport height: __root no longer wraps pages in a flex
          // column, so the teaser sizes itself.
          minHeight: '100dvh',
          // Blurring the (static) content subtree is cheap and cached; the
          // dialog renders in a portal outside it, so typing never re-blurs.
          filter: dialogOpen ? 'blur(9px)' : 'none',
        }}
      >
        <LandingPage onCtaClick={() => setDialogOpen(true)} confettiPaused={dialogOpen} />
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
      <PreviewAccessDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGranted={() => void navigate({ to: '/apps' })}
      />
    </>
  );
};

export const Route = createFileRoute('/')({ component: HomeComponent });
