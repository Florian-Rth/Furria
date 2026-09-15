import { appRouteApi } from '../app-route';

export const useSearchQuery = (): string => appRouteApi.useSearch().q ?? '';
