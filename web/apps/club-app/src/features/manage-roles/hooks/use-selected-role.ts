import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/_app/manage/roles');

export interface SelectedRole {
  roleId: number | null;
  select: (roleId: number) => void;
}

export const useSelectedRole = (): SelectedRole => {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const select = (roleId: number): void => {
    void navigate({ search: (previous) => ({ ...previous, role: roleId }), resetScroll: false });
  };

  return { roleId: search.role ?? null, select };
};
