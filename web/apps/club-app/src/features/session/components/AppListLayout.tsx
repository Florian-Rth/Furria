import { KkLead, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode, Ref } from 'react';
import { AppListColumns } from './AppListColumns';

const PHONE_ONLY_NOTE = { xs: 'flex', desktop: 'none' };

interface AppListLayoutProps {
  lead: string;
  asideNote?: string;
  sectionTitle: string;
  createAction?: ReactNode;
  toolbar?: ReactNode;
  list: ReactNode;
  footnote?: string;
  aside?: ReactNode;
  asideSize?: number;
  asideDesktopOnly?: boolean;
  asideRef?: Ref<HTMLDivElement>;
  stickyAside?: boolean;
  asideLeadsFocus?: boolean;
}

export const AppListLayout: FC<AppListLayoutProps> = ({
  lead,
  asideNote,
  sectionTitle,
  createAction,
  toolbar,
  list,
  footnote,
  aside,
  asideSize,
  asideDesktopOnly,
  asideRef,
  stickyAside,
  asideLeadsFocus,
}) => {
  const asideNoteLine =
    asideNote === undefined ? null : (
      <Stack sx={{ display: PHONE_ONLY_NOTE, minWidth: 0 }}>
        <KkNote>{asideNote}</KkNote>
      </Stack>
    );

  const leadBlock = (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkLead>{lead}</KkLead>
      {asideNoteLine}
    </Stack>
  );

  const footnoteLine = footnote === undefined ? null : <KkNote>{footnote}</KkNote>;

  return (
    <AppListColumns
      lead={leadBlock}
      sectionTitle={sectionTitle}
      createAction={createAction}
      toolbar={toolbar}
      list={list}
      footnote={footnoteLine}
      aside={aside}
      asideSize={asideSize}
      asideDesktopOnly={asideDesktopOnly}
      asideRef={asideRef}
      stickyAside={stickyAside}
      asideLeadsFocus={asideLeadsFocus}
    />
  );
};
