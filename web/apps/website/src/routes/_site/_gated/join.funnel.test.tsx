import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matcherResultLabels } from '@/features/group-matcher/matcher-content';
import {
  applyErrorTitle,
  applyFallbackLabel,
  applyFieldLabels,
  applySubmitLabel,
} from '@/features/membership/apply-content';
import { joinPageTitle } from '@/features/membership/join-content';
import { writeGrantedToSession } from '@/features/preview-access';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import { pickBirthDate } from '@/test/apply-form';
import { markChangelogSeen } from '@/test/changelog';
import { fieldByLabel } from '@/test/form';
import { renderAtRoute } from '@/test/render';

const HANDOFF_HREF = '/join/apply?groups=buettenrede,maennerballett,elferrat';

const FULL_FLOW_TIMEOUT = 30_000;

const stubFetch = (status: number): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn(async () => new Response('{}', { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const answerEveryQuestion = async (user: UserEvent): Promise<void> => {
  for (let step = 0; step < SEEDED_GROUP_MATCHER.questions.length; step += 1) {
    await user.click(
      await screen.findByRole('button', { name: step === 0 ? '18 oder älter' : 'Ja' }),
    );
  }
};

const readHandoffHref = (): string => {
  const links = screen.getAllByRole('link', { name: matcherResultLabels.applyCta });
  const hrefs = links.map((link) => link.getAttribute('href') ?? '');

  return hrefs.find((href) => href.includes('?groups=')) ?? '';
};

const fillRequiredFields = async (user: UserEvent): Promise<void> => {
  await user.type(fieldByLabel(applyFieldLabels.firstName), 'Lena');
  await user.type(fieldByLabel(applyFieldLabels.lastName), 'Brandt');
  await user.type(fieldByLabel(applyFieldLabels.street), 'Hauptstraße 12');
  await user.type(fieldByLabel(applyFieldLabels.postalCode), '99713');
  await user.type(fieldByLabel(applyFieldLabels.city), 'Großfurra');
  await user.type(fieldByLabel(applyFieldLabels.email), 'lena.brandt@example.de');
  await pickBirthDate(user, '1994-03-14');
  await user.click(screen.getByRole('checkbox', { name: /Satzung/ }));
};

beforeEach(() => {
  markChangelogSeen();
  writeGrantedToSession(window.sessionStorage);
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe('the membership funnel', () => {
  it(
    'carries the visitor from the Matcher into the Antrag and on to the confirmation',
    async () => {
      const user = userEvent.setup();
      const failingFetch = stubFetch(404);
      const join = renderAtRoute('/join');

      expect(
        await screen.findByRole('heading', { level: 1, name: joinPageTitle }),
      ).toBeInTheDocument();

      await answerEveryQuestion(user);
      await screen.findByText(matcherResultLabels.rankingTitle);

      const handoffHref = readHandoffHref();

      expect(handoffHref).toBe(HANDOFF_HREF);

      join.unmount();
      renderAtRoute(handoffHref);

      expect(await screen.findByRole('checkbox', { name: 'Büttenrede' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Männerballett' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Elferrat' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Kindergarde' })).not.toBeChecked();

      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: applySubmitLabel }));

      await waitFor(() => {
        expect(failingFetch).toHaveBeenCalledWith(
          '/api/membership-applications',
          expect.objectContaining({
            body: expect.stringContaining(
              '"groupInterests":["buettenrede","maennerballett","elferrat"]',
            ),
          }),
        );
      });

      expect(await screen.findByText(applyErrorTitle)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: applyFallbackLabel }).getAttribute('href')).toContain(
        'mailto:',
      );

      stubFetch(201);
      await user.click(screen.getByRole('button', { name: applySubmitLabel }));

      expect(
        await screen.findByRole('heading', { level: 1, name: 'DANKE, Lena.' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/noch kein Mitglied/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: applySubmitLabel })).not.toBeInTheDocument();
    },
    FULL_FLOW_TIMEOUT,
  );
});
