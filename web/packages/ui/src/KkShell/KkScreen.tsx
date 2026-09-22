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
import { footClearanceOf } from './internal/logic/foot-clearance';
import { useKkShell } from './internal/logic/shell-context';
import { useFootMeasure } from './internal/logic/use-foot-measure';
import { KkShellActionBar } from './internal/ui/KkShellActionBar';
import { KkShellBar } from './internal/ui/KkShellBar';
import type { KkShellBarLead } from './internal/ui/KkShellBarLeading';
import { KkShellEntrance } from './internal/ui/KkShellEntrance';
import { KkShellNav } from './internal/ui/KkShellNav';
import { KkShellNotice } from './internal/ui/KkShellNotice';
import { KkShellToolRow } from './internal/ui/KkShellToolRow';
import type { KkScreenProps } from './screen-declaration';

const { gutter, barHeight, chromeGap, toolRowHeight, indexWidth, screen } = kkTokens.shell;

const BAR_CLEARANCE = gutter * 2 + barHeight;
const TOOL_ROW_CLEARANCE = chromeGap + toolRowHeight;
const NO_CLEARANCE = 0;
const FIRST_ARRIVAL_BLOCK = 1;

export const KkScreen: FC<KkScreenProps> = ({
  kind,
  title,
  header,
  headerKind = 'title',
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
  const { keyboardInset, path, move } = useKkShell();
  const { ref: actionBarRef, measured: measuredActionHeight } = useFootMeasure(
    action !== undefined,
  );
  const lead: KkShellBarLead = header === undefined ? 'title' : 'brand';
  const searching = search !== undefined && search.query !== null;
  const showsTools = tools !== undefined && !searching;
  const toolRow = <KkShellToolRow open={showsTools}>{tools}</KkShellToolRow>;
  const nav = section === undefined ? null : <KkShellNav section={section} />;
  const actionBar =
    action === undefined ? null : <KkShellActionBar action={action} ref={actionBarRef} />;
  const notice = kind === 'fullscreen' ? null : <KkShellNotice />;
  const headClearance = showsTools ? BAR_CLEARANCE + TOOL_ROW_CLEARANCE : BAR_CLEARANCE;
  const footClearance = footClearanceOf({ section, action, measured: measuredActionHeight });
  const indexClearance = index === undefined ? NO_CLEARANCE : indexWidth;
  const arrivalBlocks = kind === 'fullscreen' ? FIRST_ARRIVAL_BLOCK : screen.arrivalBlocks;

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
          kind={kind}
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
        arrivalBlocks={arrivalBlocks}
      >
        <KkShellEntrance path={path} move={move}>
          <KkShellHeader kind={headerKind}>{header}</KkShellHeader>
          {children}
        </KkShellEntrance>
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
