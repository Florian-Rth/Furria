export const DEVELOPING_POLL_MS = 3_000;

interface PolledQuery<TData> {
  state: { data: TData | undefined };
}

export const pollWhileDeveloping =
  <TData>(isDeveloping: (data: TData | undefined) => boolean) =>
  (query: PolledQuery<TData>): number | false =>
    isDeveloping(query.state.data) ? DEVELOPING_POLL_MS : false;
