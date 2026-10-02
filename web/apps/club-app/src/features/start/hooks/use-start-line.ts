import type { KkDenseFacet, KkDenseLineState, KkGroupTone, KkLinkSearchValues } from '@furria/ui';
import { useKkSheetCommands } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { ElementType } from 'react';
import type { StartLineView } from '../start-lines';
import { toFacets } from '../start-lines';

export interface StartLineInput {
  line: StartLineView;
  dimmed: boolean;
  onTouch: (key: string) => void;
  onQuiet: (key: string, until: string) => void;
}

export interface StartLineRoute {
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearchValues;
}

export interface StartLineReach {
  meta: KkDenseFacet[];
  state: KkDenseLineState;
  tick: KkGroupTone | undefined;
  route: StartLineRoute;
  reach: (() => void) | undefined;
}

const NO_ROUTE: StartLineRoute = {};

export const useStartLine = ({
  line,
  dimmed,
  onTouch,
  onQuiet,
}: StartLineInput): StartLineReach => {
  const sheet = useKkSheetCommands();
  const { target } = line;

  const reach = (): void => {
    onTouch(line.key);
    onQuiet(line.key, line.until);

    if (target.kind === 'sheet') {
      sheet.open(target.sheetId);
    }
  };

  return {
    meta: toFacets(line.meta),
    state: dimmed ? 'dimmed' : 'plain',
    tick: line.tick ?? undefined,
    route:
      target.kind === 'route'
        ? { component: Link, to: target.to, params: target.params, search: target.search }
        : NO_ROUTE,
    reach: target.kind === 'none' ? undefined : reach,
  };
};
