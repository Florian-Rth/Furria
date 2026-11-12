import { useKkSheet } from '@furria/ui/sheet-store';
import type { ChangeEvent } from 'react';
import { useEffect, useEffectEvent, useState } from 'react';
import type { RichTextField } from './use-rich-text';

export interface LinkSheet {
  href: string;
  isInvalid: boolean;
  hasLink: boolean;
  onHrefChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  apply: () => void;
  remove: () => void;
}

export const useLinkSheet = (text: RichTextField, sheetId: string): LinkSheet => {
  const sheet = useKkSheet();
  const [href, setHref] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const openSheet = useEffectEvent((): void => {
    setHref(text.format.link ?? 'https://');
    setIsInvalid(false);
    sheet.open(sheetId);
  });

  useEffect(() => {
    if (text.linkRequests > 0) {
      openSheet();
    }
  }, [text.linkRequests]);

  return {
    href,
    isInvalid,
    hasLink: text.format.link !== null,
    onHrefChange: (event) => {
      setHref(event.target.value);
      setIsInvalid(false);
    },
    apply: () => {
      if (text.run({ kind: 'link', href: href.trim() })) {
        sheet.close();
        return;
      }
      setIsInvalid(true);
    },
    remove: () => {
      sheet.close();
      text.run({ kind: 'unlink' });
    },
  };
};
