import { KkHeading } from '@furria/ui/KkHeading';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { useSeasonC } from '../hooks/use-season-c';
import { SCREEN_TITLE } from '../season-c-copy';
import { SeasonCBody } from './SeasonCBody';
import { SeasonCTools } from './SeasonCTools';

const LAB_ORIGIN: KkScreenOrigin = { label: 'Labor', to: '/lab' };

export const SeasonCPage: FC = () => {
  const season = useSeasonC();
  const tools = <SeasonCTools season={season} />;

  return (
    <KkScreen kind="working" title={SCREEN_TITLE} origin={LAB_ORIGIN} tools={tools}>
      <KkVisuallyHidden>
        <KkHeading level={1}>{season.heading}</KkHeading>
      </KkVisuallyHidden>
      <SeasonCBody season={season} />
    </KkScreen>
  );
};
