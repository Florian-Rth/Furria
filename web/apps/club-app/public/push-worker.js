(() => {
  const FALLBACK_TITLE = 'FURRIA';
  const FALLBACK_PATH = '/';
  const ICON = '/app-icon-192.png';
  const OPEN_MESSAGE = 'furria:push-open';
  const APP_PATH = /^\/(?![/\\])/;

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
        icon: ICON,
        data: { path: appPathOf(message.url) },
      }),
    );
  });

  const openInApp = async (path) => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const appWindow = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (appWindow === undefined) {
      await self.clients.openWindow(path);
      return;
    }
    const focused = await appWindow.focus();
    focused.postMessage({ type: OPEN_MESSAGE, path });
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
