import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { TablePlanHelpViewer } from '../hooks/use-table-plan-help-viewer';
import { TABLE_PLAN_HELP_COPY, TABLE_PLAN_HELP_SPOTS } from '../table-plan-help-copy';
import { TablePlanHelpDockPreview } from './TablePlanHelpDockPreview';
import { TablePlanHelpFindingsPreview } from './TablePlanHelpFindingsPreview';

interface TablePlanHelpProps {
  viewer: TablePlanHelpViewer;
}

export const TablePlanHelp: FC<TablePlanHelpProps> = ({ viewer }) => {
  const { isTouch } = viewer;
  const start = viewer.isStarting ? (
    <KkHelp.Hint>
      <KkHelp.Title>{TABLE_PLAN_HELP_COPY.start.title}</KkHelp.Title>
      <KkHelp.Text>{TABLE_PLAN_HELP_COPY.start.text}</KkHelp.Text>
      <KkHelp.Text>{TABLE_PLAN_HELP_COPY.start.draw}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const viewText = isTouch ? TABLE_PLAN_HELP_COPY.view.touch : TABLE_PLAN_HELP_COPY.view.desk;
  const addText = isTouch ? TABLE_PLAN_HELP_COPY.add.touch : TABLE_PLAN_HELP_COPY.add.desk;
  const dockPreview = isTouch ? (
    <KkHelp.Preview>
      <TablePlanHelpDockPreview />
    </KkHelp.Preview>
  ) : null;
  const isEditing = !viewer.isStarting;
  const dockShow =
    isTouch && isEditing ? <ScreenHelpShow spot={TABLE_PLAN_HELP_SPOTS.tools} /> : null;
  const statusShow = isEditing ? <ScreenHelpShow spot={TABLE_PLAN_HELP_SPOTS.status} /> : null;
  const selectText = isTouch ? TABLE_PLAN_HELP_COPY.select.touch : TABLE_PLAN_HELP_COPY.select.desk;
  const settingsTouch = isTouch ? (
    <KkHelp.Text>{TABLE_PLAN_HELP_COPY.settings.touch}</KkHelp.Text>
  ) : null;
  const selectMany = isTouch ? (
    <KkHelp.Text>{TABLE_PLAN_HELP_COPY.select.touchMany}</KkHelp.Text>
  ) : null;

  return (
    <ScreenHelp>
      {start}
      <KkHelp.Hint>
        <KkHelp.Title>{TABLE_PLAN_HELP_COPY.view.title}</KkHelp.Title>
        <KkHelp.Text>{viewText}</KkHelp.Text>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.view.measure}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        {dockPreview}
        <KkHelp.Title>{TABLE_PLAN_HELP_COPY.add.title}</KkHelp.Title>
        <KkHelp.Text>{addText}</KkHelp.Text>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.add.seats}</KkHelp.Text>
        {dockShow}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{TABLE_PLAN_HELP_COPY.select.title}</KkHelp.Title>
        <KkHelp.Text>{selectText}</KkHelp.Text>
        {selectMany}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{TABLE_PLAN_HELP_COPY.chairs.title}</KkHelp.Title>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.chairs.text}</KkHelp.Text>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.chairs.seating}</KkHelp.Text>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.chairs.setup}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <TablePlanHelpFindingsPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{TABLE_PLAN_HELP_COPY.findings.title}</KkHelp.Title>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.findings.text}</KkHelp.Text>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.findings.show}</KkHelp.Text>
        {statusShow}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{TABLE_PLAN_HELP_COPY.settings.title}</KkHelp.Title>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.settings.text}</KkHelp.Text>
        {settingsTouch}
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.settings.hall}</KkHelp.Text>
        <KkHelp.Text>{TABLE_PLAN_HELP_COPY.settings.saving}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
