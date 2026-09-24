import type { KkScreenActionBar, KkScreenOrigin } from '@furria/ui';
import { KkWriteScreen } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { WriteLeaveDialog } from './components/WriteLeaveDialog';
import { useWriteScreen } from './hooks/use-write-screen';

interface WriteScreenProps extends PropsWithChildren {
  origin: KkScreenOrigin;
  title: string;
  rejection?: string;
  action: KkScreenActionBar;
  isDirty: boolean;
}

export const WriteScreen: FC<WriteScreenProps> = ({
  origin,
  title,
  rejection,
  action,
  isDirty,
  children,
}) => {
  const { guard } = useWriteScreen({ origin, isDirty });

  return (
    <>
      <KkWriteScreen origin={origin} title={title} action={action}>
        <KkWriteScreen.Fields rejection={rejection}>{children}</KkWriteScreen.Fields>
      </KkWriteScreen>
      <WriteLeaveDialog guard={guard} />
    </>
  );
};
