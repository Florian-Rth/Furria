import type { QueryClient, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import type { AltchaProof } from './altcha-proof';
import { isProofRefusal, proofFreshFor } from './altcha-proof';
import { solveAltchaChallenge } from './altcha-solver';
import { AltchaChallengeSchema } from './schemas';

export interface AltchaProofSource {
  challengePath: string;
  queryKey: QueryKey;
}

type AltchaProofQuery = UseQueryOptions<AltchaProof, Error, AltchaProof, QueryKey>;

const altchaProofQuery = (source: AltchaProofSource): AltchaProofQuery =>
  queryOptions({
    queryKey: source.queryKey,
    queryFn: async ({ signal }): Promise<AltchaProof> => {
      const challenge = await apiFetch(source.challengePath, { schema: AltchaChallengeSchema });

      return {
        payload: await solveAltchaChallenge(challenge, signal),
        expiresAt: challenge.parameters.expiresAt,
      };
    },
    staleTime: (query) => proofFreshFor(query.state.data, query.state.dataUpdatedAt),
  });

export const usePreparedAltchaProof = (source: AltchaProofSource, isNeeded: boolean): void => {
  useQuery({ ...altchaProofQuery(source), enabled: isNeeded });
};

const spendFreshProof = async (
  queryClient: QueryClient,
  source: AltchaProofSource,
): Promise<AltchaProof> => {
  const query = altchaProofQuery(source);
  const proof = await queryClient.fetchQuery(query);
  queryClient.removeQueries({ queryKey: query.queryKey, exact: true });

  return proof;
};

export const submitWithFreshProof = async <TResult>(
  queryClient: QueryClient,
  source: AltchaProofSource,
  submit: (proof: AltchaProof) => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await submit(await spendFreshProof(queryClient, source));
  } catch (error) {
    if (error instanceof Error && isProofRefusal(error)) {
      return submit(await spendFreshProof(queryClient, source));
    }
    throw error;
  }
};
