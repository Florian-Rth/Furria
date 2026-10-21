import type { InstallExit } from './install-guide';

const CHROME_PACKAGE = 'com.android.chrome';

export const browserExitHrefOf = (exit: InstallExit, href: string): string => {
  const url = new URL(href);
  const rest = `${url.host}${url.pathname}${url.search}`;

  return exit === 'safari'
    ? `x-safari-https://${rest}`
    : `intent://${rest}#Intent;scheme=https;package=${CHROME_PACKAGE};end`;
};
