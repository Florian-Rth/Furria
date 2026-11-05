import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { useTestPushMutation } from '../api';
import { PUSH_SECTION_TITLE, TEST_PUSH_ACTION, TEST_PUSH_LEAD } from '../push-copy';

export const TestPushSection: FC = () => {
  const testPush = useTestPushMutation();

  const sendTestPush = (): void => {
    testPush.mutate(undefined);
  };

  const action = { label: TEST_PUSH_ACTION, onClick: sendTestPush, disabled: testPush.isPending };

  return (
    <KkPanelSection title={PUSH_SECTION_TITLE} action={action}>
      <KkPanel variant="block">
        <KkNote tone="muted">{TEST_PUSH_LEAD}</KkNote>
      </KkPanel>
    </KkPanelSection>
  );
};
