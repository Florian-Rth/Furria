export const SEASON_UNDO_LABEL = 'Rückgängig';

export const SEASON_TOGGLE_REFUSED_MESSAGE =
  'Für diesen Abend angepasst oder schon eingeplant — im Ablauf des Abends ändern.';

export const toSeasonToggledMessage = (
  actName: string,
  eveningTitle: string,
  add: boolean,
): string =>
  add ? `${actName} steht jetzt auf ${eveningTitle}.` : `${actName} ist raus aus ${eveningTitle}.`;
