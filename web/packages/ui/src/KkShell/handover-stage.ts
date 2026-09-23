import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { KkScreenHeaderKind } from './screen-declaration';

export interface KkHandoverSwapProps {
  rest: ReactNode;
  title: ReactNode;
  restText: string | null;
  titleText: string;
}

export interface KkHandoverHeaderProps extends PropsWithChildren {
  kind: KkScreenHeaderKind;
}

export interface KkHandoverStage {
  Swap: ComponentType<KkHandoverSwapProps>;
  Header: ComponentType<KkHandoverHeaderProps>;
}

export const KkHandoverStageContext = createContext<KkHandoverStage | null>(null);

export const useKkHandoverStage = (): KkHandoverStage | null => useContext(KkHandoverStageContext);
