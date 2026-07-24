import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MotionGlobalConfig } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GROUPS, groupsChapter, groupsIntro } from '@/features/club/groups-content';
import { writeGrantedToSession } from '@/features/preview-access';
import { renderAtRoute, renderWithProviders } from '@/test/render';
import { DESKTOP_VIEWPORT_WIDTH, setViewportWidth } from '@/test/viewport';
import { GruppenGrid } from './GruppenGrid';

const getGruppen = (): HTMLElement => document.querySelector('[data-kk-gruppen]') as HTMLElement;

const firstGroup = GROUPS[0];
const secondGroup = GROUPS[1];
if (firstGroup === undefined || secondGroup === undefined) {
  throw new Error('GROUPS fixture must contain at least two Gruppen');
}

const openTile = async (user: ReturnType<typeof userEvent.setup>, title: string): Promise<void> => {
  const tile = await screen.findByRole('button', { name: new RegExp(`^${title} `) });
  await user.click(tile);
};

describe('GruppenGrid', () => {
  it('renders the numbered chapter header title', () => {
    renderWithProviders(<GruppenGrid />);

    expect(
      screen.getByRole('heading', { level: 2, name: groupsChapter.title }),
    ).toBeInTheDocument();
  });

  it('renders one tile per Gruppe in the array', () => {
    renderWithProviders(<GruppenGrid />);

    expect(getGruppen().querySelectorAll('[data-kk-gruppen-tile]')).toHaveLength(GROUPS.length);
  });

  it('shows every Gruppe title and blurb from the array', () => {
    renderWithProviders(<GruppenGrid />);

    for (const group of GROUPS) {
      expect(
        within(getGruppen()).getByRole('heading', { level: 3, name: group.title }),
      ).toBeInTheDocument();
      expect(within(getGruppen()).getByText(group.blurb)).toBeInTheDocument();
    }
  });

  it('numbers the tile badges positionally from 01', () => {
    renderWithProviders(<GruppenGrid />);

    expect(within(getGruppen()).getByText('01')).toBeInTheDocument();
    expect(
      within(getGruppen()).getByText(String(GROUPS.length).padStart(2, '0')),
    ).toBeInTheDocument();
  });

  it('surfaces the derived count so it stays in step with the stat strip', () => {
    renderWithProviders(<GruppenGrid />);

    expect(within(getGruppen()).getByText(groupsIntro)).toBeInTheDocument();
  });
});

describe('GruppenGrid detail modal', () => {
  beforeEach(() => {
    writeGrantedToSession(window.sessionStorage);
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
    MotionGlobalConfig.skipAnimations = true;
  });

  afterEach(() => {
    MotionGlobalConfig.skipAnimations = false;
    window.sessionStorage.clear();
    setViewportWidth(DESKTOP_VIEWPORT_WIDTH);
  });

  it('opens the detail modal for the clicked Gruppe', async () => {
    const user = userEvent.setup();
    renderAtRoute('/club');

    await openTile(user, firstGroup.title);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(firstGroup.fullText)).toBeInTheDocument();
    expect(within(dialog).queryByText(secondGroup.fullText)).not.toBeInTheDocument();
  });

  it('labels the dialog by its Gruppe heading for assistive tech', async () => {
    const user = userEvent.setup();
    renderAtRoute('/club');

    await openTile(user, firstGroup.title);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'gruppen-modal-title');
    expect(
      within(dialog).getByRole('heading', { level: 2, name: firstGroup.title }),
    ).toHaveAttribute('id', 'gruppen-modal-title');
  });

  it('surfaces the Leitung, Treffen and join CTA in the panel', async () => {
    const user = userEvent.setup();
    renderAtRoute('/club');

    await openTile(user, firstGroup.title);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(firstGroup.lead)).toBeInTheDocument();
    expect(within(dialog).getByText(firstGroup.schedule)).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Mitglied werden →' })).toHaveAttribute(
      'href',
      '/join',
    );
  });

  it('moves focus into the open dialog', async () => {
    const user = userEvent.setup();
    renderAtRoute('/club');

    await openTile(user, firstGroup.title);

    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('closes the modal when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderAtRoute('/club');

    await openTile(user, firstGroup.title);
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes the modal when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    renderAtRoute('/club');

    await openTile(user, firstGroup.title);
    await screen.findByRole('dialog');

    const backdrop = document.querySelector('.MuiBackdrop-root') as HTMLElement;
    await user.click(backdrop);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens the second Gruppe when its tile is clicked', async () => {
    const user = userEvent.setup();
    renderAtRoute('/club');

    await openTile(user, secondGroup.title);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(secondGroup.fullText)).toBeInTheDocument();
  });
});
