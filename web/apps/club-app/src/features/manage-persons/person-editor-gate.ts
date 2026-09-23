export type PersonEditorGate<TPerson> =
  | { kind: 'pending' }
  | { kind: 'denied'; person: TPerson | undefined }
  | { kind: 'missing' }
  | { kind: 'failed'; message: string }
  | { kind: 'ready'; person: TPerson };

export type PersonEditorHold<TPerson> = Exclude<PersonEditorGate<TPerson>, { kind: 'ready' }>;

interface PersonEditorGateInput<TPerson> {
  person: TPerson | undefined;
  isUndecided: boolean;
  mayManage: boolean;
  isForbidden: boolean;
  isMissing: boolean;
  errorMessage: string | null;
}

export const toPersonEditorGate = <TPerson>({
  person,
  isUndecided,
  mayManage,
  isForbidden,
  isMissing,
  errorMessage,
}: PersonEditorGateInput<TPerson>): PersonEditorGate<TPerson> => {
  if (isUndecided) {
    return { kind: 'pending' };
  }
  if (!mayManage || isForbidden) {
    return { kind: 'denied', person };
  }
  if (person !== undefined) {
    return { kind: 'ready', person };
  }
  if (isMissing) {
    return { kind: 'missing' };
  }
  if (errorMessage !== null) {
    return { kind: 'failed', message: errorMessage };
  }

  return { kind: 'pending' };
};
