import type { FC } from 'react';
import { kkTokens } from '../tokens';
import { KkShellChrome } from './internal/layout/KkShellChrome';
import { KkShellHeader } from './internal/layout/KkShellHeader';
import { KkShellTrack } from './internal/layout/KkShellTrack';
import { KkShellBar } from './internal/ui/KkShellBar';
import type { KkShellBarLead } from './internal/ui/KkShellBarLeading';
import { KkShellNav } from './internal/ui/KkShellNav';
import { KkShellToolRow } from './internal/ui/KkShellToolRow';
import type { KkScreenProps } from './screen-declaration';

const { gutter, chromeGap, barHeight, toolRowHeight, navHeight } = kkTokens.shell;

const BAR_CLEARANCE = gutter * 2 + barHeight;
const TOOL_ROW_CLEARANCE = chromeGap + toolRowHeight;
const NAV_CLEARANCE = gutter * 2 + navHeight;

export const KkScreen: FC<KkScreenProps> = ({
  title,
  header,
  origin,
  section,
  actions,
  search,
  tools,
  thread,
  children,
}) => {
  const lead: KkShellBarLead = header === undefined ? 'title' : 'brand';
  const searching = search !== undefined && search.query !== null;
  const showsTools = tools !== undefined && !searching;
  const toolRow = showsTools ? <KkShellToolRow>{tools}</KkShellToolRow> : null;
  const nav = section === undefined ? null : <KkShellNav section={section} />;
  const headClearance = showsTools ? BAR_CLEARANCE + TOOL_ROW_CLEARANCE : BAR_CLEARANCE;
  const footClearance = section === undefined ? gutter : NAV_CLEARANCE;

  return (
    <>
      <KkShellChrome>
        <KkShellBar
          lead={lead}
          title={title}
          origin={origin}
          actions={actions}
          search={search}
          thread={thread}
        />
        {toolRow}
      </KkShellChrome>
      <KkShellTrack headClearance={headClearance} footClearance={footClearance}>
        <KkShellHeader>{header}</KkShellHeader>
        {children}
      </KkShellTrack>
      {nav}
    </>
  );
};
