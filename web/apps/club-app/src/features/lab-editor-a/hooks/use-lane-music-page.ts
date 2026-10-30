import { useNavigate } from '@tanstack/react-router';
import { LANE_MUSIC_PAGE } from '../lane-copy';
import type { LaneMusicSearch } from '../schemas';
import type { LanePage } from './use-lane-page';
import { useLanePage } from './use-lane-page';

export interface LaneMusicPage {
  page: LanePage;
  title: string;
  tool: 'music' | 'video';
  chooseTool: (tool: 'music' | 'video') => void;
}

export const useLaneMusicPage = (rawActId: string, search: LaneMusicSearch): LaneMusicPage => {
  const navigate = useNavigate();
  const origin = {
    label: '',
    to: '/lab/editor-a/$actId',
    params: { actId: rawActId },
    search: search.evening === undefined ? undefined : { evening: String(search.evening) },
  };
  const page = useLanePage(rawActId, search, origin);
  const named = { ...page, origin: { ...origin, label: page.title } };

  return {
    page: named,
    title: LANE_MUSIC_PAGE,
    tool: search.tool ?? 'music',
    chooseTool: (tool) => {
      void navigate({
        to: '.',
        search: (previous) => ({ ...previous, tool }),
        replace: true,
      });
    },
  };
};
