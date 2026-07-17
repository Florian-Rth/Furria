import Stack from '@mui/material/Stack';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { useState } from 'react';
import { DevHomePage } from '@/features/dev-home';
import { LandingPage } from '@/features/landing';
import { PreviewAccessDialog, usePreviewAccess } from '@/features/preview-access';

// The route composes the two features: the public teaser with its unlock
// dialog, and the dev-home testers see once access is granted.
const HomeComponent: FC = () => {
  const { granted } = usePreviewAccess();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (granted) {
    return <DevHomePage />;
  }

  return (
    <>
      <Stack
        sx={{
          flex: 1,
          // Blurring the (static) content subtree is cheap and cached; the
          // dialog renders in a portal outside it, so typing never re-blurs.
          filter: dialogOpen ? 'blur(9px)' : 'none',
        }}
      >
        <LandingPage onCtaClick={() => setDialogOpen(true)} confettiPaused={dialogOpen} />
      </Stack>
      <PreviewAccessDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export const Route = createFileRoute('/')({ component: HomeComponent });
