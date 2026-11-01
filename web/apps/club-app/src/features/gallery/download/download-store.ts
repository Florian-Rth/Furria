import { readInstallTarget } from '@/features/app-install/install-environment';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import type { DownloadSink } from './download-sink';
import { openDownloadSink } from './download-sink';
import type { DownloadFailure, DownloadJob, DownloadRequest, SaveRoute } from './media-download';
import {
  closesOnDelivery,
  downloadFailureOfError,
  downloadFailureOfStatus,
  expectedBytesOf,
  saveRouteOf,
} from './media-download';

const NOTIFY_MS = 250;
const REVOKE_AFTER_MS = 60_000;
const ZIP_TYPE = 'application/zip';
const FALLBACK_TYPE = 'application/octet-stream';
const PROBE_NAME = 'probe.zip';

interface Running {
  key: number;
  abort: AbortController;
  sink: DownloadSink | null;
  wakeLock: WakeLockSentinel | null;
}

class DownloadStatusError extends Error {
  readonly failure: DownloadFailure;

  constructor(failure: DownloadFailure) {
    super(failure);
    this.failure = failure;
  }
}

const listeners = new Set<() => void>();
let job: DownloadJob | null = null;
let running: Running | null = null;
let heldSink: DownloadSink | null = null;
let nextKey = 1;
let notifyTimer: number | null = null;

const publish = (): void => {
  if (notifyTimer !== null) {
    window.clearTimeout(notifyTimer);
    notifyTimer = null;
  }
  for (const listener of listeners) {
    listener();
  }
};

const publishSoon = (): void => {
  if (notifyTimer === null) {
    notifyTimer = window.setTimeout(publish, NOTIFY_MS);
  }
};

const holdTabOpen = (event: BeforeUnloadEvent): void => {
  if (job?.phase === 'running') {
    event.preventDefault();
  }
};

const sharesFile = (file: File): boolean => {
  if (typeof navigator.canShare !== 'function') {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
};

const saveRouteFor = (file: File): SaveRoute =>
  saveRouteOf({ system: readInstallTarget().system, sharesFile: sharesFile(file) });

export const zipSaveRoute = (): SaveRoute =>
  saveRouteFor(new File([], PROBE_NAME, { type: ZIP_TYPE }));

const requestWakeLock = async (): Promise<WakeLockSentinel | null> => {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') {
    return null;
  }
  try {
    return await navigator.wakeLock.request('screen');
  } catch {
    return null;
  }
};

const settleRunning = (current: Running): void => {
  void current.wakeLock?.release();
  current.wakeLock = null;
  if (running === current) {
    running = null;
    window.removeEventListener('beforeunload', holdTabOpen);
  }
};

const isCurrent = (current: Running): boolean =>
  running === current && !current.abort.signal.aborted;

const downloadAnchor = (file: File): void => {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.rel = 'noopener';
  anchor.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, REVOKE_AFTER_MS);
};

const shareFile = (file: File): void => {
  void navigator.share({ files: [file], title: file.name }).catch(() => undefined);
};

const deliver = (file: File, route: SaveRoute): void => {
  if (route === 'share') {
    shareFile(file);
    return;
  }
  downloadAnchor(file);
};

const streamInto = async (
  current: Running,
  response: Response,
  sink: DownloadSink,
  receive: (bytes: number) => void,
): Promise<void> => {
  if (response.body === null) {
    throw new DownloadStatusError('unexpected');
  }
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      return;
    }
    if (!isCurrent(current)) {
      await reader.cancel().catch(() => undefined);
      return;
    }
    await sink.write(value);
    receive(value.byteLength);
  }
};

const fetchArchive = async (current: Running, url: string): Promise<Response> => {
  const response = await fetch(url, { signal: current.abort.signal, cache: 'no-store' });
  if (!response.ok) {
    throw new DownloadStatusError(downloadFailureOfStatus(response.status));
  }
  return response;
};

const failureOf = (error: Error): DownloadFailure =>
  error instanceof DownloadStatusError ? error.failure : downloadFailureOfError(error);

const run = async (current: Running, request: DownloadRequest, url: string): Promise<void> => {
  let received = 0;
  const receive = (bytes: number): void => {
    received += bytes;
    if (job !== null && job.key === current.key) {
      job = { ...job, phase: 'running', receivedBytes: received };
      publishSoon();
    }
  };
  const announce = (expected: number): void => {
    if (job !== null && job.key === current.key) {
      job = { ...job, phase: 'running', expectedBytes: expected };
      publishSoon();
    }
  };
  try {
    current.wakeLock = await requestWakeLock();
    const sink = await openDownloadSink(current.key);
    current.sink = sink;
    const response = await fetchArchive(current, url);
    const expected = expectedBytesOf(request.expectedBytes, response.headers.get('content-length'));
    announce(expected);
    await streamInto(current, response, sink, receive);
    if (!isCurrent(current)) {
      return;
    }
    const type = response.headers.get('content-type') ?? FALLBACK_TYPE;
    const file = await sink.finish(request.fileName, type);
    const route = saveRouteFor(file);
    heldSink = sink;
    job = {
      key: current.key,
      request,
      expectedBytes: expected,
      receivedBytes: received,
      phase: 'ready',
      file,
      route,
    };
    settleRunning(current);
    publish();
    if (route === 'download') {
      deliver(file, route);
    }
    if (closesOnDelivery(request.kind, route)) {
      closeDownload();
    }
  } catch (error) {
    if (!isCurrent(current)) {
      return;
    }
    await current.sink?.discard();
    job = {
      key: current.key,
      request,
      expectedBytes: job?.expectedBytes ?? request.expectedBytes,
      receivedBytes: received,
      phase: 'failed',
      failure: error instanceof Error ? failureOf(error) : 'unexpected',
    };
    settleRunning(current);
    publish();
  }
};

const stopRunning = (): void => {
  const current = running;
  if (current === null) {
    return;
  }
  current.abort.abort();
  settleRunning(current);
  void current.sink?.discard();
};

const releaseHeld = (): void => {
  void heldSink?.discard();
  heldSink = null;
};

const begin = (request: DownloadRequest, url: string): void => {
  stopRunning();
  releaseHeld();
  const current: Running = {
    key: nextKey,
    abort: new AbortController(),
    sink: null,
    wakeLock: null,
  };
  nextKey += 1;
  running = current;
  window.addEventListener('beforeunload', holdTabOpen);
  job = {
    key: current.key,
    request,
    expectedBytes: request.expectedBytes,
    receivedBytes: 0,
    phase: 'running',
  };
  publish();
  void run(current, request, url);
};

export const startDownload = (request: DownloadRequest): void => {
  begin(request, request.url);
};

export const retryDownload = (): void => {
  if (job?.phase !== 'failed') {
    return;
  }
  const { request } = job;
  void request
    .refreshUrl()
    .then((url) => {
      begin({ ...request, url }, url);
    })
    .catch(() => {
      begin(request, request.url);
    });
};

export const saveDownload = (): void => {
  if (job?.phase === 'ready') {
    deliver(job.file, job.route);
  }
};

export const closeDownload = (): void => {
  stopRunning();
  releaseHeld();
  job = null;
  publish();
};

subscribeToSessionEnd(closeDownload);

export const isDownloadRunning = (): boolean => job?.phase === 'running';

export const readDownload = (): DownloadJob | null => job;

export const subscribeToDownload = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
