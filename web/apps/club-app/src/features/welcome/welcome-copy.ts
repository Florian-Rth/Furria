import type { KkWelcomeStageLineTone } from '@furria/ui/KkWelcomeStageLine';
import type { WelcomeJoining, WelcomeLine, WelcomePlan } from './welcome-plan';
import { CLUB_FOUNDED_YEAR } from './welcome-plan';

export const WELCOME_DATELINE = `Furrscher Carnevals Club e.V. · seit ${CLUB_FOUNDED_YEAR}`;
export const WELCOME_FOUNDED_LINE = `Seit ${CLUB_FOUNDED_YEAR} feiern wir.`;
export const WELCOME_SKIP_LABEL = 'Überspringen';
export const WELCOME_ENTER_LABEL = 'Los geht’s';
export const WELCOME_CALL_LEAD = 'Groß –';
export const WELCOME_CALL_ANSWER = 'Furria!';

export const CONSENT_QUESTION = 'In die Vereinsgruppe aufnehmen?';
export const CONSENT_EXPLANATION =
  'Der Vereins-Bot fügt dich mit deiner Handynummer zur WhatsApp-Gruppe des Vereins hinzu. Ändern kannst du das jederzeit in deinem Profil.';
export const CONSENT_PHONE_LABEL = 'Handynummer';
export const CONSENT_NO_PHONE = 'Noch nicht hinterlegt';
export const CONSENT_CONFIRM_LABEL = 'Ja, aufnehmen';
export const CONSENT_CANCEL_LABEL = 'Nein, danke';

const FIRST_SESSION = 1;

export const welcomeLabelOf = (firstName: string): string => `Willkommen, ${firstName}`;

export const joinedLineOf = (joining: WelcomeJoining): string => {
  if (joining.kind === 'since') {
    return `${joining.year} kamst du dazu.`;
  }

  return joining.kind === 'founding' ? 'Von Anfang an mit dir.' : 'Jetzt kommst du dazu.';
};

export const billLineOf = (line: WelcomeLine): string => {
  if (line.kind === 'function') {
    return line.name;
  }

  return line.ordinal === FIRST_SESSION ? 'Deine erste Session' : `Deine ${line.ordinal}. Session`;
};

export interface WelcomeBillLine {
  key: string;
  text: string;
  at: number;
  tone: KkWelcomeStageLineTone;
}

export const welcomeBillOf = (plan: WelcomePlan): WelcomeBillLine[] =>
  plan.lines.map((line, index) => ({
    key: `${line.kind}-${index}`,
    text: billLineOf(line),
    at: plan.beats.lines[index] ?? plan.beats.sweep,
    tone: index === 0 ? 'lead' : 'plain',
  }));
