import { useKkSheet } from '@furria/ui';
import type { ChangeEvent } from 'react';
import { useEffect, useEffectEvent, useState } from 'react';
import { LINK_SHEET_ID } from '../editor-copy';
import type { ProseText } from './use-prose-text';

export interface LinkSheet {
  href: string;
  isInvalid: boolean;
  hasLink: boolean;
  onHrefChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  apply: () => void;
  remove: () => void;
}

export const useLinkSheet = (text: ProseText): LinkSheet => {
  const sheet = useKkSheet();
  const [href, setHref] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const openSheet = useEffectEvent((): void => {
    setHref(text.format.link ?? 'https://');
    setIsInvalid(false);
    sheet.open(LINK_SHEET_ID);
  });

  useEffect(() => {
    if (text.linkRequestKey > 0) {
      openSheet();
    }
  }, [text.linkRequestKey]);

  return {
    href,
    isInvalid,
    hasLink: text.format.link !== null,
    onHrefChange: (event) => {
      setHref(event.target.value);
      setIsInvalid(false);
    },
    apply: () => {
      if (text.setLink(href.trim())) {
        sheet.close();
        return;
      }
      setIsInvalid(true);
    },
    remove: () => {
      sheet.close();
      text.unlink();
    },
  };
};
