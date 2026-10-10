import type { FC } from 'react';
import { createPortal } from 'react-dom';
import { KkLetterIndex } from '../KkLetterIndex';
import { kkTokens } from '../tokens';
import { HANDOVER_STAGES } from './handover/handover-stages';
import { KkHandoverStageContext } from './handover-stage';
import { KkShellHeader } from './internal/layout/KkShellHeader';
import { footClearanceOf } from './internal/logic/foot-clearance';
import { ScreenArrivalContext, useScreenArrivalGate } from './internal/logic/screen-arrival';
import { sectionOriginOf } from './internal/logic/section-origin';
import { useKkShell } from './internal/logic/shell-context';
import { useFootMeasure } from './internal/logic/use-foot-measure';
import { useScreenStance } from './internal/logic/use-screen-stance';
import { KkShellActionBar } from './internal/ui/KkShellActionBar';
import { KkShellBar } from './internal/ui/KkShellBar';
import type { KkShellBarLead } from './internal/ui/KkShellBarLeading';
import { KkShellCustomFoot } from './internal/ui/KkShellCustomFoot';
import { KkShellEntrance } from './internal/ui/KkShellEntrance';
import { KkShellToolRow } from './internal/ui/KkShellToolRow';
import type { KkScreenProps } from './screen-declaration';

const { gutter, barHeight, chromeGap, toolRowHeight, indexWidth } = kkTokens.shell;

const BAR_CLEARANCE = gutter * 2 + barHeight;
const TOOL_ROW_CLEARANCE = chromeGap + toolRowHeight;
const NO_CLEARANCE = 0;

export const KkScreen: FC<KkScreenProps> = ({
  kind,
  title,
  sceneKey,
  header,
  headerKind = 'title',
  origin,
  section,
  actions,
  action,
  foot,
  search,
  tools,
  index,
  thread,
  handover,
  children,
}) => {
  const { path, move, destinations, chromeHost, footHost, indexHost } = useKkShell();
  const gate = useScreenArrivalGate();
  const { ref: actionBarRef, measured: measuredActionHeight } = useFootMeasure(
    action !== undefined || foot !== undefined,
  );
  const barOrigin = origin ?? sectionOriginOf({ section, path, destinations });
  const lead: KkShellBarLead = header === undefined ? 'title' : 'brand';
  const searching = search !== undefined && search.query !== null;
  const showsTools = tools !== undefined && !searching;
  const headClearance = showsTools ? BAR_CLEARANCE + TOOL_ROW_CLEARANCE : BAR_CLEARANCE;
  const footClearance = footClearanceOf({
    section,
    action,
    hasFoot: foot !== undefined,
    measured: measuredActionHeight,
  });
  const indexClearance = index === undefined ? NO_CLEARANCE : indexWidth;

  useScreenStance({
    kind,
    section: section ?? null,
    headClearance,
    footClearance,
    indexClearance,
  });

  const chrome =
    chromeHost === null
      ? null
      : createPortal(
          <>
            <KkShellBar
              kind={kind}
              lead={lead}
              title={title}
              origin={barOrigin}
              actions={actions}
              search={search}
              thread={thread}
            />
            <KkShellToolRow open={showsTools}>{tools}</KkShellToolRow>
          </>,
          chromeHost,
        );

  const actionBar =
    action === undefined || footHost === null
      ? null
      : createPortal(<KkShellActionBar action={action} ref={actionBarRef} />, footHost);

  const customFoot =
    foot === undefined || footHost === null
      ? null
      : createPortal(<KkShellCustomFoot ref={actionBarRef}>{foot}</KkShellCustomFoot>, footHost);

  const letterIndex =
    index === undefined || indexHost === null
      ? null
      : createPortal(
          <KkLetterIndex
            variant="rail"
            label={index.label}
            letters={index.letters}
            current={index.current}
            onSelect={index.onSelect}
          />,
          indexHost,
        );

  const stage = handover === undefined ? null : HANDOVER_STAGES[handover];
  const Header = stage?.Header ?? KkShellHeader;

  return (
    <KkHandoverStageContext.Provider value={stage}>
      {chrome}
      {actionBar}
      {customFoot}
      {letterIndex}
      <ScreenArrivalContext.Provider value={gate.arrival}>
        <KkShellEntrance path={sceneKey ?? path} move={move} bodyHeld={gate.held}>
          <Header kind={headerKind}>{header}</Header>
          {children}
        </KkShellEntrance>
      </ScreenArrivalContext.Provider>
    </KkHandoverStageContext.Provider>
  );
};
