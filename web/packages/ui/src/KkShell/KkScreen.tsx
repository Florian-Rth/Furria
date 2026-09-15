import GlobalStyles from '@mui/material/GlobalStyles';
import type { FC } from 'react';
import { safeArea } from '../internal/safe-area';
import { KkLetterIndex } from '../KkLetterIndex';
import { kkTokens } from '../tokens';
import { KkShellChrome } from './internal/layout/KkShellChrome';
import { KkShellFoot } from './internal/layout/KkShellFoot';
import { KkShellHeader } from './internal/layout/KkShellHeader';
import { KkShellIndex } from './internal/layout/KkShellIndex';
import { KkShellTrack } from './internal/layout/KkShellTrack';
import { actionBarHeightOf } from './internal/logic/action-bar-height';
import { useKkShell } from './internal/logic/shell-context';
import { KkShellActionBar } from './internal/ui/KkShellActionBar';
import { KkShellBar } from './internal/ui/KkShellBar';
import type { KkShellBarLead } from './internal/ui/KkShellBarLeading';
import { KkShellNav } from './internal/ui/KkShellNav';
import { KkShellNotice } from './internal/ui/KkShellNotice';
import { KkShellToolRow } from './internal/ui/KkShellToolRow';
import type { KkScreenActionBar, KkScreenProps } from './screen-declaration';

const { gutter, chromeGap, barHeight, toolRowHeight, navHeight, indexWidth } = kkTokens.shell;

const BAR_CLEARANCE = gutter * 2 + barHeight;
const TOOL_ROW_CLEARANCE = chromeGap + toolRowHeight;
const NAV_CLEARANCE = gutter * 2 + navHeight;
const NO_CLEARANCE = 0;

const footClearanceOf = (
  section: string | undefined,
  action: KkScreenActionBar | undefined,
): number => {
  if (action !== undefined) {
    return gutter * 2 + actionBarHeightOf(action);
  }

  return section === undefined ? gutter : NAV_CLEARANCE;
};

export const KkScreen: FC<KkScreenProps> = ({
  kind,
  title,
  header,
  origin,
  section,
  actions,
  action,
  search,
  tools,
  index,
  thread,
  children,
}) => {
  const { keyboardInset } = useKkShell();
  const lead: KkShellBarLead = header === undefined ? 'title' : 'brand';
  const searching = search !== undefined && search.query !== null;
  const showsTools = tools !== undefined && !searching;
  const toolRow = showsTools ? <KkShellToolRow>{tools}</KkShellToolRow> : null;
  const nav = section === undefined ? null : <KkShellNav section={section} />;
  const actionBar = action === undefined ? null : <KkShellActionBar action={action} />;
  const notice = kind === 'fullscreen' ? null : <KkShellNotice />;
  const headClearance = showsTools ? BAR_CLEARANCE + TOOL_ROW_CLEARANCE : BAR_CLEARANCE;
  const footClearance = footClearanceOf(section, action);
  const indexClearance = index === undefined ? NO_CLEARANCE : indexWidth;

  const scrollClearance = {
    html: {
      scrollPaddingTop: safeArea('top', headClearance),
      scrollPaddingBottom: safeArea('bottom', footClearance),
    },
  };

  const letterIndex =
    index === undefined ? null : (
      <KkShellIndex headClearance={headClearance} footClearance={footClearance}>
        <KkLetterIndex
          variant="rail"
          label={index.label}
          letters={index.letters}
          current={index.current}
          onSelect={index.onSelect}
        />
      </KkShellIndex>
    );

  return (
    <>
      <GlobalStyles styles={scrollClearance} />
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
      <KkShellTrack
        headClearance={headClearance}
        footClearance={footClearance}
        indexClearance={indexClearance}
      >
        <KkShellHeader>{header}</KkShellHeader>
        {children}
      </KkShellTrack>
      {letterIndex}
      <KkShellFoot raise={keyboardInset}>
        {notice}
        {actionBar}
        {nav}
      </KkShellFoot>
    </>
  );
};
