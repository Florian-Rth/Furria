import type { KkIconTab } from '@furria/ui/KkIconTabs';
import { KkIconTabs } from '@furria/ui/KkIconTabs';
import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import type { FC, ReactNode } from 'react';
import { usePlanner } from '../planner-context';
import {
  CATALOGUE_TITLE,
  CLOSE_LABEL,
  FINDINGS_TITLE,
  toPersonFact,
  WISHES_PANE_LABEL,
  WISHES_TITLE,
} from '../planner-copy';
import type { PaneView } from '../planner-modes';
import { paneViewOf } from '../planner-modes';
import { PlannerFindings } from './PlannerFindings';
import { PlannerPersonTimeline } from './PlannerPersonTimeline';
import { PlannerRowDetail } from './PlannerRowDetail';
import { PlannerWishBoard } from './PlannerWishBoard';

const PANE_TITLES: Record<PaneView, string> = {
  catalogue: CATALOGUE_TITLE,
  findings: FINDINGS_TITLE,
  wishes: WISHES_TITLE,
};

const PANE_TABS: KkIconTab[] = [
  { id: 'findings', label: FINDINGS_TITLE, icon: 'checkCircle' },
  { id: 'wishes', label: WISHES_TITLE, icon: 'wish' },
];

const contentOf = (view: PaneView): ReactNode => {
  switch (view) {
    case 'catalogue':
      return null;
    case 'findings':
      return <PlannerFindings />;
    case 'wishes':
      return <PlannerWishBoard />;
  }
};

export const PlannerPane: FC = () => {
  const planner = usePlanner();
  const selected = planner.draft.lines.find((line) => line.key === planner.selectedKey) ?? null;
  const timeline = planner.person;

  if (timeline !== null) {
    const name = `${timeline.person.firstName} ${timeline.person.lastName}`;
    const meta = toPersonFact(timeline);

    return (
      <KkPaneLayout.Pane label={name}>
        <KkPaneLayout.PaneHead
          title={name}
          meta={meta}
          closeLabel={CLOSE_LABEL}
          onClose={planner.closePerson}
        />
        <KkPaneLayout.PaneBody key={`person:${timeline.person.personId}`}>
          <PlannerPersonTimeline timeline={timeline} />
        </KkPaneLayout.PaneBody>
      </KkPaneLayout.Pane>
    );
  }

  if (selected !== null) {
    return (
      <KkPaneLayout.Pane label={selected.act.name}>
        <KkPaneLayout.PaneHead
          title={selected.act.name}
          closeLabel={CLOSE_LABEL}
          onClose={planner.closeSelection}
        />
        <KkPaneLayout.PaneBody key={selected.key}>
          <PlannerRowDetail line={selected} />
        </KkPaneLayout.PaneBody>
      </KkPaneLayout.Pane>
    );
  }

  const view = paneViewOf(planner.mode, planner.wishesOpen);
  const title = PANE_TITLES[view];
  const content = contentOf(view);
  const chooseView = (id: string): void => {
    if (id === 'wishes') {
      planner.openWishes();
    } else {
      planner.closeWishes();
    }
  };
  const tabs =
    planner.mode === 'order' ? (
      <KkIconTabs label={WISHES_PANE_LABEL} tabs={PANE_TABS} value={view} onChange={chooseView} />
    ) : null;

  return (
    <KkPaneLayout.Pane label={title}>
      <KkPaneLayout.PaneHead title={title} tools={tabs} />
      <KkPaneLayout.PaneBody key={view}>{content}</KkPaneLayout.PaneBody>
    </KkPaneLayout.Pane>
  );
};
