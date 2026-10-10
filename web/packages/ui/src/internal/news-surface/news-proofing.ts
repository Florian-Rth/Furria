import { createContext, useContext } from 'react';

export interface KkNewsProofing {
  untitled: string;
  teaserPlaceholder: string;
}

export const NewsProofingContext = createContext<KkNewsProofing | null>(null);

export const useNewsProofing = (): KkNewsProofing | null => useContext(NewsProofingContext);

export type KkNewsCutReport = (key: string, cut: boolean) => void;

export const NewsCutReportContext = createContext<KkNewsCutReport | null>(null);

export const useNewsCutReport = (): KkNewsCutReport | null => useContext(NewsCutReportContext);
