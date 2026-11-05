(() => {
  const FALLBACK_TITLE = 'FURRIA';
  const FALLBACK_PATH = '/';
  const ICON = '/app-icon-192.png';
  const OPEN_MESSAGE = 'furria:push-open';
  const APP_PATH = /^\/(?![/\\])\P{Cc}*$/u;

  const appPathOf = (path) =>
    typeof path === 'string' && APP_PATH.test(path) ? path : FALLBACK_PATH;

  const messageOf = (data) => {
    try {
      return data?.json() ?? {};
    } catch {
      return {};
    }
  };

  self.addEventListener('push', (event) => {
    const message = messageOf(event.data);
    event.waitUntil(
      self.registration.showNotification(message.title || FALLBACK_TITLE, {
        body: message.body || '',
        tag: message.tag || undefined,
        renotify: Boolean(message.tag),
        icon: ICON,
        data: { path: appPathOf(message.url) },
      }),
    );
  });

  const isSeen = (client) => client.focused || client.visibilityState === 'visible';

  const focusQuietly = async (client) => {
    try {
      await client.focus();
    } catch {
      return;
    }
  };

  const openInApp = async (path) => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const appWindows = windows.filter(
      (client) => new URL(client.url).origin === self.location.origin,
    );
    const appWindow = appWindows.find(isSeen) ?? appWindows[0];
    if (appWindow === undefined) {
      await self.clients.openWindow(path);
      return;
    }
    await focusQuietly(appWindow);
    appWindow.postMessage({ type: OPEN_MESSAGE, path });
  };

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(openInApp(appPathOf(event.notification.data?.path)));
  });

  self.addEventListener('pushsubscriptionchange', (event) => {
    const options = event.oldSubscription?.options;
    if (options === undefined) {
      return;
    }
    event.waitUntil(self.registration.pushManager.subscribe(options));
  });
})();
