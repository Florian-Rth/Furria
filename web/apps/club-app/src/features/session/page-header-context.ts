import { createContext, useContext } from 'react';

export const PageHeaderContext = createContext<HTMLElement | null>(null);

export const usePageHeaderContainer = (): HTMLElement | null => useContext(PageHeaderContext);
