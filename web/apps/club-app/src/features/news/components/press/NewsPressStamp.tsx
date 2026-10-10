import { KkPressStamp } from '@furria/ui';
import type { FC } from 'react';
import { useState } from 'react';
import { PUBLIC_NEWS_PATH, WEBSITE_HOST } from '../../news-copy';
import { STAMP_TITLES } from '../../press-copy';
import type { PressKind } from '../../press-run';
import { pressAddressOf, pressSignatureOf } from '../../press-run';
import type { NewsPublication } from '../../types';

interface NewsPressStampProps {
  kind: PressKind;
  post: NewsPublication;
  signer: string;
}

export const NewsPressStamp: FC<NewsPressStampProps> = ({ kind, post, signer }) => {
  const [pressedAt] = useState(() => new Date().toISOString());
  const stampedAt = kind === 'first' ? post.publishedAt : pressedAt;

  return (
    <KkPressStamp
      title={STAMP_TITLES[kind]}
      signature={pressSignatureOf(signer, stampedAt)}
      address={pressAddressOf(WEBSITE_HOST, PUBLIC_NEWS_PATH, post.slug)}
    />
  );
};
