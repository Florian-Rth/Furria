import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import { renderWithProviders } from '@/test/render';
import { KonfettiKompass } from './KonfettiKompass';

const questions = SEEDED_GROUP_MATCHER.questions;
const questionCount = questions.length;

const firstPrompt = questions[0]?.prompt ?? '';
const secondPrompt = questions[1]?.prompt ?? '';
const lastPrompt = questions[questionCount - 1]?.prompt ?? '';

const AGE_BAND_LABEL = '18 oder älter';

const findPrompt = (prompt: string): Promise<HTMLElement> => screen.findByText(prompt);

const clickButton = async (user: UserEvent, name: string): Promise<void> => {
  await user.click(screen.getByRole('button', { name }));
};

const answerCurrent = async (user: UserEvent, step: number): Promise<void> => {
  await clickButton(user, step === 0 ? AGE_BAND_LABEL : 'Ja');
};

const answerEveryQuestion = async (user: UserEvent): Promise<void> => {
  for (let step = 0; step < questionCount; step += 1) {
    await answerCurrent(user, step);
  }
};

const skipEveryQuestion = async (user: UserEvent): Promise<void> => {
  for (let step = 0; step < questionCount; step += 1) {
    await clickButton(user, 'überspringen');
  }
};

afterEach(() => {
  window.sessionStorage.clear();
});

describe('KonfettiKompass', () => {
  it('names itself the Kompass and never an -O-Mat', async () => {
    renderWithProviders(<KonfettiKompass />);

    expect(
      await screen.findByRole('heading', { level: 2, name: 'WO PASSE ICH HIN?' }),
    ).toBeInTheDocument();
    expect(screen.getByText('KONFETTI-KOMPASS')).toBeInTheDocument();
    expect(document.body.textContent?.toLowerCase()).not.toContain('-mat');
  });

  it('waits with a status while the questions are still loading', () => {
    renderWithProviders(<KonfettiKompass />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('opens on the first question alone, with nothing filled in yet', async () => {
    renderWithProviders(<KonfettiKompass />);

    expect(await findPrompt(firstPrompt)).toBeInTheDocument();
    expect(screen.queryByText(secondPrompt)).not.toBeInTheDocument();
    expect(screen.getByText(`Frage 1 von ${questionCount}`)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('advances to the next question as soon as an answer is given', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);

    await answerCurrent(user, 0);

    expect(await findPrompt(secondPrompt)).toBeInTheDocument();
    expect(screen.getByText(`Frage 2 von ${questionCount}`)).toBeInTheDocument();
  });

  it('goes back to the question before and cannot step in front of the first one', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);
    await answerCurrent(user, 0);
    await findPrompt(secondPrompt);

    await clickButton(user, '← zurück');

    expect(await findPrompt(firstPrompt)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← zurück' })).toBeDisabled();
  });

  it('lets the visitor skip a question without answering it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);

    await clickButton(user, 'überspringen');

    expect(await findPrompt(secondPrompt)).toBeInTheDocument();
  });

  it('reaches the end and reports how many answers it got', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);

    await answerEveryQuestion(user);

    expect(await screen.findByText('ALLE FRAGEN DURCH.')).toBeInTheDocument();
    expect(
      screen.getByText(`Du hast ${questionCount} von ${questionCount} Fragen beantwortet.`),
    ).toBeInTheDocument();
    expect(screen.getByText('Alle Fragen durch')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('steps back from the end to the last question', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);
    await skipEveryQuestion(user);
    await screen.findByText('ALLE FRAGEN DURCH.');

    await clickButton(user, '← zurück');

    expect(await findPrompt(lastPrompt)).toBeInTheDocument();
  });

  it('says so plainly when every question was skipped', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);

    await skipEveryQuestion(user);

    expect(await screen.findByText('Du hast jede Frage übersprungen.')).toBeInTheDocument();
  });

  it('keeps the answers through a reload of the page', async () => {
    const user = userEvent.setup();
    const first = renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);
    await answerCurrent(user, 0);
    await findPrompt(secondPrompt);
    first.unmount();

    renderWithProviders(<KonfettiKompass />);

    expect(await findPrompt(secondPrompt)).toBeInTheDocument();
    expect(screen.getByText(`Frage 2 von ${questionCount}`)).toBeInTheDocument();
  });

  it('forgets every answer when the visitor starts over', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);
    await skipEveryQuestion(user);
    await screen.findByText('ALLE FRAGEN DURCH.');

    await clickButton(user, 'Von vorne');

    expect(await findPrompt(firstPrompt)).toBeInTheDocument();
    expect(window.sessionStorage.getItem('furria.kompass.answers')).toBeNull();
  });
});
