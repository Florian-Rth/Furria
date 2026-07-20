import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { DevHomePage } from '@/features/dev-home';

// The tester portal: launch links into the three apps. Unlocking redirects here.
const AppsComponent: FC = () => <DevHomePage />;

export const Route = createFileRoute('/_site/_gated/apps')({ component: AppsComponent });
