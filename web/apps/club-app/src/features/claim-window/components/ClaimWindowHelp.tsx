import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { CLAIM_WINDOW_HELP_COPY, CLAIM_WINDOW_HELP_SPOTS } from '../claim-window-help-copy';
import { ClaimWindowHelpClaimsPreview } from './ClaimWindowHelpClaimsPreview';

export const ClaimWindowHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{CLAIM_WINDOW_HELP_COPY.state.title}</KkHelp.Title>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.state.text}</KkHelp.Text>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.state.reach}</KkHelp.Text>
      <ScreenHelpShow spot={CLAIM_WINDOW_HELP_SPOTS.state} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLAIM_WINDOW_HELP_COPY.end.title}</KkHelp.Title>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.end.text}</KkHelp.Text>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.end.open}</KkHelp.Text>
      <ScreenHelpShow spot={CLAIM_WINDOW_HELP_SPOTS.end} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLAIM_WINDOW_HELP_COPY.match.title}</KkHelp.Title>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.match.text}</KkHelp.Text>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.match.others}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLAIM_WINDOW_HELP_COPY.address.title}</KkHelp.Title>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.address.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLAIM_WINDOW_HELP_SPOTS.address} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <ClaimWindowHelpClaimsPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{CLAIM_WINDOW_HELP_COPY.claims.title}</KkHelp.Title>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.claims.text}</KkHelp.Text>
      <KkHelp.Text>{CLAIM_WINDOW_HELP_COPY.claims.wrong}</KkHelp.Text>
      <ScreenHelpShow spot={CLAIM_WINDOW_HELP_SPOTS.claims} />
    </KkHelp.Hint>
  </ScreenHelp>
);
