import type { KkScreenOrigin } from '../../screen-declaration';
import type { KkShellDestination } from '../../shell-destination';

const TRAILING_SLASHES = /\/+$/;
const ROOT_PATH = '/';

interface KkSectionPlace {
  section: string | undefined;
  path: string;
  destinations: readonly KkShellDestination[];
}

const trimmedPath = (path: string): string => path.replace(TRAILING_SLASHES, '') || ROOT_PATH;

export const sectionOriginOf = ({
  section,
  path,
  destinations,
}: KkSectionPlace): KkScreenOrigin | undefined => {
  const destination = destinations.find((entry) => entry.id === section);

  if (destination === undefined || trimmedPath(destination.to) === trimmedPath(path)) {
    return undefined;
  }

  return { label: destination.label, to: destination.to };
};
