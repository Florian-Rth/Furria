import { readInstallTarget } from '@/features/app-install/install-environment';
import { readStandalone } from '@/features/app-install/standalone-store';
import { applicationServerKeyOf } from './push-key';
import type { PushTraits } from './push-readiness';
import { requestPushKey, requestPushRemoval, requestPushSubscription } from './requests';
import { PushDeviceSchema } from './schemas';

export class PushPermissionRefusedError extends Error {
  constructor() {
    super('Notification permission was not granted.');
    this.name = 'PushPermissionRefusedError';
  }
}

const hasPushApi = (): boolean =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const readSubscription = async (): Promise<PushSubscription | null> => {
  const registration = hasPushApi() ? await navigator.serviceWorker.getRegistration() : undefined;

  return registration === undefined ? null : registration.pushManager.getSubscription();
};

const activeRegistration = async (): Promise<ServiceWorkerRegistration> => {
  if (!hasPushApi() || (await navigator.serviceWorker.getRegistration()) === undefined) {
    throw new Error('No service worker can receive pushes on this device.');
  }

  return navigator.serviceWorker.ready;
};

export const readPushTraits = async (): Promise<PushTraits> => ({
  canPush: hasPushApi(),
  system: readInstallTarget().system,
  standalone: readStandalone(),
  permission: hasPushApi() ? Notification.permission : 'default',
  subscribed: (await readSubscription()) !== null,
});

export const askPushPermission = (): Promise<NotificationPermission> =>
  hasPushApi() ? Notification.requestPermission() : Promise.resolve('denied');

const sameBytes = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length && left.every((octet, index) => octet === right[index]);

const isSignedBy = (subscription: PushSubscription, serverKey: Uint8Array): boolean => {
  const current = subscription.options.applicationServerKey;

  return current !== null && sameBytes(new Uint8Array(current), serverKey);
};

const subscriptionFor = async (
  registration: ServiceWorkerRegistration,
  accessToken: string,
): Promise<PushSubscription> => {
  const { publicKey } = await requestPushKey(accessToken);
  const serverKey = applicationServerKeyOf(publicKey);
  const current = await registration.pushManager.getSubscription();
  if (current !== null && isSignedBy(current, serverKey)) {
    return current;
  }
  if (current !== null) {
    await requestPushRemoval(current.endpoint, accessToken);
    await current.unsubscribe();
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: serverKey,
  });
};

const announce = async (subscription: PushSubscription, accessToken: string): Promise<void> =>
  requestPushSubscription(PushDeviceSchema.parse(subscription.toJSON()), accessToken);

export const subscribeThisDevice = async (
  permission: Promise<NotificationPermission>,
  accessToken: string,
): Promise<void> => {
  if ((await permission) !== 'granted') {
    throw new PushPermissionRefusedError();
  }
  const registration = await activeRegistration();

  await announce(await subscriptionFor(registration, accessToken), accessToken);
};

export const unsubscribeThisDevice = async (accessToken: string): Promise<void> => {
  const subscription = await readSubscription();
  if (subscription === null) {
    return;
  }

  try {
    await requestPushRemoval(subscription.endpoint, accessToken);
  } finally {
    await subscription.unsubscribe();
  }
};

export const unsubscribeLocally = async (): Promise<void> => {
  await (await readSubscription())?.unsubscribe();
};

export const resyncThisDevice = async (accessToken: string): Promise<void> => {
  if ((await readSubscription()) === null || Notification.permission !== 'granted') {
    return;
  }
  const registration = await activeRegistration();

  await announce(await subscriptionFor(registration, accessToken), accessToken);
};
