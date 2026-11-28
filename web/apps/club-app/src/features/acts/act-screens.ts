export const ACT_PRACTICE_PATH = '/acts/$actId/practice';
export const ACT_EDIT_PATH = '/acts/$actId/edit';
export const ACT_MUSIC_PATH = '/acts/$actId/music';
export const ACT_VIDEOS_PATH = '/acts/$actId/videos';
export const ACT_STEP_SETUP_PATH = '/acts/$actId/steps/setup';

export type ActScreen =
  | { kind: 'practice' }
  | { kind: 'edit' }
  | { kind: 'music' }
  | { kind: 'videos' }
  | { kind: 'stepSetup' };

export interface ActScreenLink {
  to: string;
  params: Record<string, string>;
}

export const actScreenLinkOf = (actId: number, screen: ActScreen): ActScreenLink => {
  const id = String(actId);

  switch (screen.kind) {
    case 'practice':
      return { to: ACT_PRACTICE_PATH, params: { actId: id } };
    case 'edit':
      return { to: ACT_EDIT_PATH, params: { actId: id } };
    case 'music':
      return { to: ACT_MUSIC_PATH, params: { actId: id } };
    case 'videos':
      return { to: ACT_VIDEOS_PATH, params: { actId: id } };
    case 'stepSetup':
      return { to: ACT_STEP_SETUP_PATH, params: { actId: id } };
  }
};

export const actScreenPathOf = (actId: number, screen: ActScreen): string => {
  const link = actScreenLinkOf(actId, screen);

  return Object.entries(link.params).reduce(
    (path, [name, value]) => path.replace(`$${name}`, value),
    link.to,
  );
};

export const switchedEditingOf = (screen: ActScreen): ActScreen => {
  if (screen.kind === 'practice') {
    return { kind: 'edit' };
  }

  return screen.kind === 'edit' ? { kind: 'practice' } : screen;
};
