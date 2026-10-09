import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { PictureEditor } from '@/features/pictures';
import { toInitials } from '@/lib/initials';
import { parsePositiveId } from '@/lib/positive-id';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toPersonName, toPersonOrigin } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';

const ROUTE_ID = '/_app/manage/persons_/$personId_/portrait';
const TITLE = 'Porträt';

export const PersonPortraitScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const { gate, retry } = usePersonEditorGate(parsePositiveId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  const { person } = gate;
  const target = { kind: 'portrait', ownerId: person.personId } as const;
  const origin = toPersonOrigin(person);
  const name = toPersonName(person);
  const initials = toInitials(person.firstName, person.lastName);

  return (
    <PictureEditor
      target={target}
      editing={person.portrait}
      origin={origin}
      alt={name}
      placeholderLabel={initials}
      refresh={retry}
    />
  );
};
