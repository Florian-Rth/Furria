import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { useSeasonA } from '../hooks/use-season-a';
import { SEASON_A_TITLE } from '../season-a-copy';
import { SeasonABody } from './SeasonABody';
import { SeasonATools } from './SeasonATools';

export const SeasonAPage: FC = () => {
  const season = useSeasonA();
  const tools = season.query.data === undefined ? undefined : <SeasonATools season={season} />;

  return (
    <KkScreen kind="working" title={SEASON_A_TITLE} origin={LAB_ORIGIN} tools={tools}>
      <SeasonABody season={season} />
    </KkScreen>
  );
};
