import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { kompassMailHref } from '@/features/group-matcher/kompass-content';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import { renderWithProviders } from '@/test/render';
import { KonfettiKompass } from './KonfettiKompass';

const questions = SEEDED_GROUP_MATCHER.questions;
const questionCount = questions.length;

const firstPrompt = questions[0]?.prompt ?? '';
const secondPrompt = questions[1]?.prompt ?? '';
const fourthPrompt = questions[3]?.prompt ?? '';
const lastPrompt = questions[questionCount - 1]?.prompt ?? '';

const AGE_BAND_LABEL = '18 oder älter';
const FINISH_LABEL = 'Ergebnis ansehen →';
const CHANGE_LABEL = 'Antworten ändern';
const APPLY_LABEL = 'Antrag stellen →';
const RANKING_TITLE = 'DAS PASST ZU DIR.';
const UNANSWERED_TITLE = 'NOCH KEINE ANTWORT.';

const findPrompt = (prompt: string): Promise<HTMLElement> => screen.findByText(prompt);

const clickButton = async (user: UserEvent, name: string): Promise<void> => {
  await user.click(screen.getByRole('button', { name }));
};

const answerCurrent = async (user: UserEvent, step: number): Promise<void> => {
  await clickButton(user, step === 0 ? AGE_BAND_LABEL : 'Ja');
};

const answerQuestions = async (user: UserEvent, count: number): Promise<void> => {
  for (let step = 0; step < count; step += 1) {
    await answerCurrent(user, step);
  }
};

const answerEveryQuestion = (user: UserEvent): Promise<void> =>
  answerQuestions(user, questionCount);

const skipEveryQuestion = async (user: UserEvent): Promise<void> => {
  for (let step = 0; step < questionCount; step += 1) {
    await clickButton(user, 'überspringen');
  }
};

const rankEveryQuestion = async (user: UserEvent): Promise<void> => {
  await findPrompt(firstPrompt);
  await answerEveryQuestion(user);
  await screen.findByText(RANKING_TITLE);
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
    expect(screen.getByRole('button', { name: FINISH_LABEL })).toBeDisabled();
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

  it('ranks every Gruppe that is still possible, best match first', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);

    await rankEveryQuestion(user);

    expect(
      screen.getByText(`Du hast ${questionCount} von ${questionCount} Fragen beantwortet.`),
    ).toBeInTheDocument();
    expect(screen.getByText('BESTE ÜBEREINSTIMMUNG')).toBeInTheDocument();
    expect(screen.getByLabelText('83 % Übereinstimmung mit Büttenrede')).toBeInTheDocument();
    expect(screen.getByLabelText('60 % Übereinstimmung mit Männerballett')).toBeInTheDocument();
    expect(screen.getByLabelText('60 % Übereinstimmung mit Elferrat')).toBeInTheDocument();
    expect(screen.getByLabelText('47 % Übereinstimmung mit Organisation')).toBeInTheDocument();
    expect(screen.getByLabelText('43 % Übereinstimmung mit Tanzgarde')).toBeInTheDocument();
  });

  it('badges the Gruppe that is not looking without moving it out of the ranking', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);

    await rankEveryQuestion(user);

    expect(screen.getByText('Sucht gerade nicht')).toBeInTheDocument();
    expect(screen.getAllByText('Sucht Verstärkung')).toHaveLength(4);
    expect(screen.getByText('3.')).toBeInTheDocument();
  });

  it('opens the derived why of a Gruppe on demand', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await rankEveryQuestion(user);
    const why = screen.getByRole('button', { name: 'Warum Büttenrede?' });

    expect(why).toHaveAttribute('aria-expanded', 'false');
    await user.click(why);

    expect(why).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getAllByText('Du: Ja · Büttenrede: Ja · der Gruppe besonders wichtig').length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Du: Ja · Büttenrede: Nein · der Gruppe wichtig')).toBeInTheDocument();
  });

  it('names the Gruppe it had to rule out, and why', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);

    await rankEveryQuestion(user);

    expect(screen.getByText('Kindergarde')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Deine Antwort „18 oder älter“ auf „Wie alt bist du?“ schließt diese Gruppe aus.',
      ),
    ).toBeInTheDocument();
  });

  it('hands the Antrag the best Gruppen and keeps a human within reach', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);

    await rankEveryQuestion(user);

    expect(screen.getByRole('link', { name: APPLY_LABEL })).toHaveAttribute(
      'href',
      '/join/apply?groups=buettenrede,maennerballett,elferrat',
    );
    expect(screen.getByRole('link', { name: 'Erst eine Frage stellen' })).toHaveAttribute(
      'href',
      kompassMailHref,
    );
    expect(
      screen.getByText(
        'Wir nehmen Büttenrede, Männerballett und Elferrat als Interesse mit — im Antrag kannst du das ändern.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the result early and returns to the question the visitor left', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);
    await answerQuestions(user, 3);
    await findPrompt(fourthPrompt);

    await clickButton(user, FINISH_LABEL);
    expect(await screen.findByText(RANKING_TITLE)).toBeInTheDocument();

    await clickButton(user, CHANGE_LABEL);

    expect(await findPrompt(fourthPrompt)).toBeInTheDocument();
  });

  it('steps back from the result to the last question', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);
    await skipEveryQuestion(user);
    await screen.findByText(UNANSWERED_TITLE);

    await clickButton(user, CHANGE_LABEL);

    expect(await findPrompt(lastPrompt)).toBeInTheDocument();
  });

  it('asks for at least one answer instead of ranking nothing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KonfettiKompass />);
    await findPrompt(firstPrompt);

    await skipEveryQuestion(user);

    expect(await screen.findByText(UNANSWERED_TITLE)).toBeInTheDocument();
    expect(screen.getByText('Du hast jede Frage übersprungen.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: APPLY_LABEL })).not.toBeInTheDocument();
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
    await screen.findByText(UNANSWERED_TITLE);

    await clickButton(user, 'Von vorne');

    expect(await findPrompt(firstPrompt)).toBeInTheDocument();
    expect(window.sessionStorage.getItem('furria.kompass.answers')).toBeNull();
  });
});
