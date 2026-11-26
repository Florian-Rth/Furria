import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { RUNNING_ORDER_HELP_COPY, RUNNING_ORDER_HELP_SPOTS } from '../running-order-help-copy';
import { RunningOrderHelpMarksPreview } from './RunningOrderHelpMarksPreview';
import { RunningOrderHelpModesPreview } from './RunningOrderHelpModesPreview';

export const RunningOrderHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <RunningOrderHelpModesPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.modes.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.modes.text}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.modes.saving}</KkHelp.Text>
      <ScreenHelpShow spot={RUNNING_ORDER_HELP_SPOTS.modes} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.pick.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.pick.text}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.pick.newAct}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.order.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.order.text}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.order.unplaced}</KkHelp.Text>
      <ScreenHelpShow spot={RUNNING_ORDER_HELP_SPOTS.list} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.hold.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.hold.text}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.hold.row}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.wishes.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.wishes.text}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.wishes.strength}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.autoOrder.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.autoOrder.text}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.autoOrder.proposal}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.autoOrder.holds}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <RunningOrderHelpMarksPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.marks.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.marks.conflict}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.marks.hint}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.marks.fix}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{RUNNING_ORDER_HELP_COPY.confirm.title}</KkHelp.Title>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.confirm.text}</KkHelp.Text>
      <KkHelp.Text>{RUNNING_ORDER_HELP_COPY.confirm.reopen}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
