import type { KkPublishCeremonyRun, KkPublishStamp } from '@furria/ui';
import { useKkPublishCeremony } from '@furria/ui';
import { useState } from 'react';
import { WEBSITE_HOST } from '@/lib/publish-copy';
import { PUBLIC_NEWS_PATH } from '../news-copy';
import { STAMP_TITLES } from '../press-copy';
import type { PressKind } from '../press-kind';
import { pressAddressOf } from '../press-kind';
import type { NewsPublication } from '../types';

export interface NewsPress {
  ceremony: KkPublishCeremonyRun<NewsPublication>;
  kind: PressKind;
  isBusy: boolean;
  start: (kind: PressKind, job: () => Promise<NewsPublication>) => void;
}

interface NewsPressOptions {
  signer: string;
  onPublished: (post: NewsPublication) => void;
  onFailed: (error: Error) => void;
}

export const useNewsPress = ({ signer, onPublished, onFailed }: NewsPressOptions): NewsPress => {
  const [kind, setKind] = useState<PressKind>('first');

  const stampOf = (post: NewsPublication, stampedAt: string): KkPublishStamp => ({
    title: STAMP_TITLES[kind],
    signer,
    at: kind === 'first' ? post.publishedAt : stampedAt,
    address: pressAddressOf(WEBSITE_HOST, PUBLIC_NEWS_PATH, post.slug),
  });

  const ceremony = useKkPublishCeremony({ stampOf, onPublished, onFailed });

  return {
    ceremony,
    kind,
    isBusy: ceremony.isBusy,
    start: (nextKind, job) => {
      if (ceremony.isBusy) {
        return;
      }
      setKind(nextKind);
      ceremony.start(job);
    },
  };
};
