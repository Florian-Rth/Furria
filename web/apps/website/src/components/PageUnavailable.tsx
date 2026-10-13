import { KkButton, KkErrorState, KkSection, PageLayout } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const PAGE_UNAVAILABLE_TITLE = 'DIESE SEITE KLEMMT GERADE.';
const PAGE_UNAVAILABLE_TEXT =
  'Beim Laden ist etwas schiefgegangen. Lad die Seite neu — meistens ist dann alles wieder da.';

export const PageUnavailable: FC = () => {
  const reload = (): void => {
    window.location.reload();
  };

  return (
    <PageLayout>
      <PageLayout.Body>
        <KkSection>
          <KkErrorState
            title={PAGE_UNAVAILABLE_TITLE}
            description={PAGE_UNAVAILABLE_TEXT}
            action={
              <Stack
                direction="row"
                sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}
              >
                <KkButton onClick={reload}>Seite neu laden</KkButton>
                <KkButton variant="outlined" href="/">
                  Zur Startseite
                </KkButton>
              </Stack>
            }
          />
        </KkSection>
      </PageLayout.Body>
    </PageLayout>
  );
};
