import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { useTestPushMutation } from '../api';
import { PUSH_SECTION_TITLE, TEST_PUSH_ACTION } from '../push-copy';

interface TestPushSectionProps {
  landing?: string;
}

export const TestPushSection: FC<TestPushSectionProps> = ({ landing }) => {
  const testPush = useTestPushMutation();

  const sendTestPush = (): void => {
    testPush.mutate(undefined);
  };

  const action = { label: TEST_PUSH_ACTION, onClick: sendTestPush, disabled: testPush.isPending };

  return <KkPanelSection title={PUSH_SECTION_TITLE} action={action} landing={landing} />;
};
