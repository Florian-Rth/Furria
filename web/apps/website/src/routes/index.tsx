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
      <LandingPage onCtaClick={() => setDialogOpen(true)} />
      <PreviewAccessDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export const Route = createFileRoute('/')({ component: HomeComponent });
