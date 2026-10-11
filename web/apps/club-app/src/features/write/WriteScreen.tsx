import type { KkPublishCeremonyStage, KkScreenActionBar, KkScreenOrigin } from '@furria/ui';
import { KkPublishCeremony, KkWriteScreen } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { PUBLISH_ANNOUNCEMENTS } from '@/lib/publish-copy';
import { WriteLeaveDialog } from './components/WriteLeaveDialog';
import { useWriteScreen } from './hooks/use-write-screen';

interface WriteScreenProps extends PropsWithChildren {
  origin: KkScreenOrigin;
  title: string;
  rejection?: string;
  action: KkScreenActionBar;
  isDirty: boolean;
  ceremony?: KkPublishCeremonyStage;
}

export const WriteScreen: FC<WriteScreenProps> = ({
  origin,
  title,
  rejection,
  action,
  isDirty,
  ceremony,
  children,
}) => {
  const { guard } = useWriteScreen({ origin, isDirty });
  const fields = <KkWriteScreen.Fields rejection={rejection}>{children}</KkWriteScreen.Fields>;
  const content =
    ceremony === undefined ? (
      fields
    ) : (
      <KkPublishCeremony stage={ceremony} announcements={PUBLISH_ANNOUNCEMENTS}>
        {fields}
      </KkPublishCeremony>
    );

  return (
    <>
      <KkWriteScreen origin={origin} title={title} action={action}>
        {content}
      </KkWriteScreen>
      <WriteLeaveDialog guard={guard} />
    </>
  );
};
