import { describe, expect, it } from 'vitest';
import { logsPathOf } from './log-query';
import type { LogFilter } from './types';

describe('logsPathOf', () => {
  it.each<{ label: string; filter: LogFilter; before: number | null; path: string }>([
    {
      label: 'asks for every source from the newest entry on',
      filter: { source: 'all', minimumLevel: 'warning', search: '' },
      before: null,
      path: '/api/system/logs?minimumLevel=warning&take=100',
    },
    {
      label: 'narrows to one source, a search and a page below a known entry',
      filter: { source: 'mediaWorker', minimumLevel: 'error', search: 'ffmpeg exit' },
      before: 812,
      path: '/api/system/logs?source=mediaWorker&minimumLevel=error&search=ffmpeg+exit&before=812&take=100',
    },
  ])('$label', ({ filter, before, path }) => {
    expect(logsPathOf(filter, before, 100)).toBe(path);
  });
});
