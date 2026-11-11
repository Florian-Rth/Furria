import { useState } from 'react';

export interface NamesSheetControl {
  tabId: string | null;
  isOpen: boolean;
  query: string;
  open: (tabId: string) => void;
  close: () => void;
  select: (tabId: string) => void;
  setQuery: (query: string) => void;
}

export const useNamesSheet = (): NamesSheetControl => {
  const [tabId, setTabId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  return {
    tabId,
    isOpen,
    query,
    open: (next) => {
      setTabId(next);
      setQuery('');
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
    select: setTabId,
    setQuery,
  };
};
