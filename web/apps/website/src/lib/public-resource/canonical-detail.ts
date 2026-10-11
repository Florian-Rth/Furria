import type { AnyRedirect } from '@tanstack/react-router';
import { notFound } from '@tanstack/react-router';
import type { PublicDetailRead } from './define-public-resource';
import { isMissingRead } from './public-source';

export type DetailRead<TDetail> =
  | { status: 'unaddressable' }
  | { status: 'found'; detail: TDetail }
  | { status: 'failed'; error: Error };

export type CanonicalDetail<TDetail> =
  | { kind: 'show'; detail: TDetail }
  | { kind: 'not-found' }
  | { kind: 'redirect'; canonicalSlug: string }
  | { kind: 'fail'; error: Error };

export const resolveCanonicalDetail = <TDetail extends TItem, TItem>(
  requestedSlug: string,
  read: DetailRead<TDetail>,
  slugOf: (item: TItem) => string,
): CanonicalDetail<TDetail> => {
  if (read.status === 'unaddressable') {
    return { kind: 'not-found' };
  }

  if (read.status === 'failed') {
    return isMissingRead(read.error) ? { kind: 'not-found' } : { kind: 'fail', error: read.error };
  }

  const canonicalSlug = slugOf(read.detail);

  return canonicalSlug === requestedSlug
    ? { kind: 'show', detail: read.detail }
    : { kind: 'redirect', canonicalSlug };
};

const readDetail = <TDetail extends TItem, TItem>(
  resource: PublicDetailRead<TDetail, TItem>,
  requestedSlug: string,
): Promise<DetailRead<TDetail>> => {
  const detailKey = resource.readDetailKey(requestedSlug);

  if (detailKey === null) {
    return Promise.resolve({ status: 'unaddressable' });
  }

  return resource.ensureDetail(detailKey).then(
    (detail): DetailRead<TDetail> => ({ status: 'found', detail }),
    (error: Error): DetailRead<TDetail> => ({ status: 'failed', error }),
  );
};

export const loadCanonicalDetail = async <TDetail extends TItem, TItem>(
  resource: PublicDetailRead<TDetail, TItem>,
  requestedSlug: string,
  redirectToCanonical: (canonicalSlug: string) => AnyRedirect,
): Promise<TDetail> => {
  const outcome = resolveCanonicalDetail(
    requestedSlug,
    await readDetail(resource, requestedSlug),
    resource.slugOf,
  );

  if (outcome.kind === 'not-found') {
    throw notFound();
  }

  if (outcome.kind === 'redirect') {
    throw redirectToCanonical(outcome.canonicalSlug);
  }

  if (outcome.kind === 'fail') {
    throw outcome.error;
  }

  return outcome.detail;
};
