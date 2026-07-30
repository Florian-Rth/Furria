import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyErrorTitle,
  applyFallbackLabel,
  applyFieldLabels,
  applyGuardianLegend,
  applySatzungHref,
  applySatzungLabel,
  applySubmitLabel,
} from '@/features/membership/apply-content';
import { renderWithProviders } from '@/test/render';
import { ApplyPage } from './ApplyPage';

const labelPattern = (label: string): RegExp => new RegExp(`^${label}( \\*)?$`);

const fieldByLabel = (label: string): HTMLElement => screen.getByLabelText(labelPattern(label));

const stubFetch = (status: number): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn(async () => new Response('{}', { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const setBirthDate = (value: string): void => {
  fireEvent.change(fieldByLabel(applyFieldLabels.birthDate), { target: { value } });
};

const fillRequiredFields = async (user: UserEvent, birthDate: string): Promise<void> => {
  await user.type(fieldByLabel(applyFieldLabels.firstName), 'Lena');
  await user.type(fieldByLabel(applyFieldLabels.lastName), 'Brandt');
  await user.type(fieldByLabel(applyFieldLabels.street), 'Hauptstraße 12');
  await user.type(fieldByLabel(applyFieldLabels.postalCode), '99713');
  await user.type(fieldByLabel(applyFieldLabels.city), 'Großfurra');
  await user.type(fieldByLabel(applyFieldLabels.email), 'lena.brandt@example.de');
  setBirthDate(birthDate);
};

const submit = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: applySubmitLabel }));
};

const consentCheckbox = (): HTMLElement => screen.getByRole('checkbox', { name: /Satzung/ });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ApplyPage', () => {
  it('asks for the full postal address, not just the Wohnort', () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    expect(fieldByLabel(applyFieldLabels.street)).toBeInTheDocument();
    expect(fieldByLabel(applyFieldLabels.postalCode)).toBeInTheDocument();
    expect(fieldByLabel(applyFieldLabels.city)).toBeInTheDocument();
  });

  it('never lets the applicant pick a Mitgliedschaftsart', () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Mitgliedschaftsart/)).not.toBeInTheDocument();
  });

  it('waits for the Geburtsdatum before naming a Mitgliedschaft', () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    expect(screen.getAllByText('steht mit dem Geburtsdatum')).toHaveLength(2);
    expect(screen.getByText('0 €')).toBeInTheDocument();
  });

  it('derives Aktiv and 30 € from an adult Geburtsdatum', async () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    setBirthDate('1994-03-14');

    expect(await screen.findByText('Aktiv')).toBeInTheDocument();
    expect(screen.getByText('30 € im Jahr')).toBeInTheDocument();
    expect(screen.queryByText(applyGuardianLegend)).not.toBeInTheDocument();
  });

  it('derives Jugend and 15 € under 18 and opens the guardian block', async () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    setBirthDate('2015-05-04');

    expect(await screen.findByText('Jugend')).toBeInTheDocument();
    expect(screen.getByText('15 € im Jahr')).toBeInTheDocument();
    expect(screen.getByText(applyGuardianLegend)).toBeInTheDocument();
    expect(fieldByLabel(applyFieldLabels.guardianName)).toBeInTheDocument();
  });

  it('words the Einwilligung as the guardian’s once one is needed', async () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    setBirthDate('2015-05-04');

    expect(await screen.findByText(/Als gesetzliche Vertretung/)).toBeInTheDocument();
  });

  it('starts with one unchecked Einwilligung that carries no photo consent', () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    expect(screen.getAllByRole('checkbox', { name: /Satzung/ })).toHaveLength(1);
    expect(consentCheckbox()).not.toBeChecked();
    expect(document.body.textContent?.toLowerCase()).not.toContain('foto');
    expect(document.body.textContent?.toLowerCase()).not.toContain('instagram');
  });

  it('links the Satzung as a plain anchor, next to the Datenschutzhinweise', () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    expect(screen.getByRole('link', { name: applySatzungLabel })).toHaveAttribute(
      'href',
      applySatzungHref,
    );
    expect(screen.getByRole('link', { name: 'Datenschutzhinweise' })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });

  it('refuses to send the Antrag while the Einwilligung is missing', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(404);
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    await fillRequiredFields(user, '1994-03-14');
    await submit(user);

    expect(
      await screen.findByText('Ohne diese Einwilligung dürfen wir den Antrag nicht annehmen.'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('insists on a guardian contact for someone under 18', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(404);
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    await fillRequiredFields(user, '2015-05-04');
    await user.click(consentCheckbox());
    await submit(user);

    expect(
      await screen.findByText('Bitte trag den Namen einer erwachsenen Person ein, die zustimmt.'),
    ).toBeInTheDocument();

    await user.type(fieldByLabel(applyFieldLabels.guardianName), 'Katrin Brandt');
    await submit(user);

    expect(
      await screen.findByText('Bitte trag E-Mail oder Telefon der erwachsenen Person ein.'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the Antrag to the real endpoint and falls back to a human when it is not there', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(404);
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    await fillRequiredFields(user, '1994-03-14');
    await user.click(consentCheckbox());
    await submit(user);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/membership-applications',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    expect(await screen.findByText(applyErrorTitle)).toBeInTheDocument();

    const fallback = screen.getByRole('link', { name: applyFallbackLabel });
    const href = fallback.getAttribute('href') ?? '';

    expect(href).toContain('mailto:');
    expect(decodeURIComponent(href)).toContain('Lena');
    expect(decodeURIComponent(href)).toContain('14. März 1994');
    expect(fieldByLabel(applyFieldLabels.firstName)).toHaveValue('Lena');
  });

  it('reports success and drops the Antrag silently when the honeypot was filled', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(404);
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    await fillRequiredFields(user, '1994-03-14');
    await user.click(consentCheckbox());
    fireEvent.change(screen.getByPlaceholderText('Dieses Feld bitte leer lassen'), {
      target: { value: 'https://spam.example' },
    });
    await submit(user);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'DANKE, Lena.' }),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('confirms in place without calling the applicant a Mitglied', async () => {
    const user = userEvent.setup();
    stubFetch(201);
    renderWithProviders(<ApplyPage prefilledGroupInterests={[]} />);

    await fillRequiredFields(user, '1994-03-14');
    await user.click(consentCheckbox());
    await submit(user);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'DANKE, Lena.' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: applySubmitLabel })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: /WILLKOMMEN/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/noch kein Mitglied/)).toBeInTheDocument();
  });

  it('ticks the Gruppen the Kompass handed over', async () => {
    renderWithProviders(<ApplyPage prefilledGroupInterests={['organisation']} />);

    expect(await screen.findByRole('checkbox', { name: 'Organisation' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Tanzgarde' })).not.toBeChecked();
  });

  it('lets the applicant untick a Gruppe the Kompass suggested', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplyPage prefilledGroupInterests={['organisation']} />);

    await user.click(await screen.findByRole('checkbox', { name: 'Organisation' }));

    expect(screen.getByRole('checkbox', { name: 'Organisation' })).not.toBeChecked();
  });

  it('sends no Gruppe the roster does not know, however it got into the url', async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetch(201);
    renderWithProviders(
      <ApplyPage prefilledGroupInterests={['organisation', 'showtanz', 'werkstatt']} />,
    );

    await screen.findByRole('checkbox', { name: 'Organisation' });
    await fillRequiredFields(user, '1994-03-14');
    await user.click(consentCheckbox());
    await submit(user);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/membership-applications',
        expect.objectContaining({
          body: expect.stringContaining('"groupInterests":["organisation"]'),
        }),
      );
    });
  });
});
