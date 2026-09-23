import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toHubId } from '../group-hub-labels';
import { GENERATOR_SHEET_TITLE } from '../rhythm-labels';
import { GroupEditorUnloaded } from './GroupEditorUnloaded';
import { HubEditorDenied } from './HubEditorDenied';
import { TrainingGeneratorPage } from './TrainingGeneratorPage';

const ROUTE_ID = '/_app/groups_/$groupId_/trainings';

export const TrainingGeneratorScreen: FC = () => {
  const { groupId } = useParams({ from: ROUTE_ID });
  const id = toHubId(groupId);
  const hub = useGroupHubQuery(id);

  if (hub.data === undefined) {
    return <GroupEditorUnloaded groupId={id} />;
  }
  if (!hub.data.viewerMayManage) {
    return (
      <HubEditorDenied
        hub={hub.data}
        title={GENERATOR_SHEET_TITLE}
        message={EDITOR_DENIED_MESSAGE}
      />
    );
  }

  return <TrainingGeneratorPage hub={hub.data} />;
};
