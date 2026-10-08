import { KkEyebrow, KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { TicketRequestFormKit } from '@/features/events/components/TicketRequestFormKit/TicketRequestFormKit';
import type { TicketRequestFormState } from '@/features/events/hooks/use-ticket-request-form';
import {
  ticketRequestConsentLegend,
  ticketRequestConsentNote,
  ticketRequestContactLegend,
  ticketRequestContactNote,
  ticketRequestCountLegend,
  ticketRequestCountNote,
  ticketRequestErrorTitle,
  ticketRequestFieldLabels,
  ticketRequestMessageLegend,
  ticketRequestPersonLegend,
  ticketRequestSubmitDisabledHint,
  ticketRequestSubmitLabel,
  ticketRequestSubmitNote,
  ticketRequestSummaryEyebrow,
  ticketRequestSummaryNote,
} from '@/features/events/ticket-request-content';
import type { Event } from '@/lib/public-events/schemas';
import { TicketRequestHeader } from './TicketRequestHeader';

const MESSAGE_ROWS = 3;

interface TicketRequestFormSectionProps {
  event: Event;
  state: TicketRequestFormState;
}

export const TicketRequestFormSection: FC<TicketRequestFormSectionProps> = ({ event, state }) => {
  const submitError =
    state.submitError === null ? null : (
      <TicketRequestFormKit.Error
        title={ticketRequestErrorTitle}
        message={state.submitError}
        fallback={state.fallback}
      />
    );

  return (
    <KkSection>
      <TicketRequestHeader event={event} />
      <TicketRequestFormKit form={state.form} onSubmit={state.submit}>
        <TicketRequestFormKit.Columns>
          <TicketRequestFormKit.Main>
            <TicketRequestFormKit.Block>
              <TicketRequestFormKit.Legend required>
                {ticketRequestCountLegend}
              </TicketRequestFormKit.Legend>
              <TicketRequestFormKit.BlockBody>
                <TicketRequestFormKit.Fields>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TicketRequestFormKit.Count />
                  </Grid>
                </TicketRequestFormKit.Fields>
                <TicketRequestFormKit.Note>{ticketRequestCountNote}</TicketRequestFormKit.Note>
              </TicketRequestFormKit.BlockBody>
            </TicketRequestFormKit.Block>
            <TicketRequestFormKit.Block>
              <TicketRequestFormKit.Legend>{ticketRequestPersonLegend}</TicketRequestFormKit.Legend>
              <TicketRequestFormKit.BlockBody>
                <TicketRequestFormKit.Fields>
                  <Grid size={12}>
                    <TicketRequestFormKit.Field
                      name="name"
                      label={ticketRequestFieldLabels.name}
                      required
                      autoComplete="name"
                    />
                  </Grid>
                </TicketRequestFormKit.Fields>
              </TicketRequestFormKit.BlockBody>
            </TicketRequestFormKit.Block>
            <TicketRequestFormKit.Block>
              <TicketRequestFormKit.Legend>
                {ticketRequestContactLegend}
              </TicketRequestFormKit.Legend>
              <TicketRequestFormKit.BlockBody>
                <TicketRequestFormKit.Fields>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TicketRequestFormKit.Field
                      name="phone"
                      label={ticketRequestFieldLabels.phone}
                      type="tel"
                      required
                      autoComplete="tel"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <TicketRequestFormKit.Field
                      name="email"
                      label={ticketRequestFieldLabels.email}
                      type="email"
                      required
                      autoComplete="email"
                    />
                  </Grid>
                </TicketRequestFormKit.Fields>
                <TicketRequestFormKit.Note>{ticketRequestContactNote}</TicketRequestFormKit.Note>
              </TicketRequestFormKit.BlockBody>
            </TicketRequestFormKit.Block>
            <TicketRequestFormKit.Block>
              <TicketRequestFormKit.Legend>
                {ticketRequestMessageLegend}
              </TicketRequestFormKit.Legend>
              <TicketRequestFormKit.BlockBody>
                <TicketRequestFormKit.Field
                  name="message"
                  label={ticketRequestFieldLabels.message}
                  required={false}
                  minRows={MESSAGE_ROWS}
                />
              </TicketRequestFormKit.BlockBody>
            </TicketRequestFormKit.Block>
            <TicketRequestFormKit.Block>
              <TicketRequestFormKit.Legend required>
                {ticketRequestConsentLegend}
              </TicketRequestFormKit.Legend>
              <TicketRequestFormKit.BlockBody>
                <TicketRequestFormKit.Consent>
                  <TicketRequestFormKit.ConsentLabel />
                </TicketRequestFormKit.Consent>
                <TicketRequestFormKit.Note>{ticketRequestConsentNote}</TicketRequestFormKit.Note>
              </TicketRequestFormKit.BlockBody>
            </TicketRequestFormKit.Block>
            <TicketRequestFormKit.Honeypot />
          </TicketRequestFormKit.Main>
          <TicketRequestFormKit.Aside>
            <TicketRequestFormKit.Summary>
              <KkEyebrow>{ticketRequestSummaryEyebrow}</KkEyebrow>
              {state.summaryRows.map((row) => (
                <TicketRequestFormKit.SummaryRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                />
              ))}
              <TicketRequestFormKit.Note>{ticketRequestSummaryNote}</TicketRequestFormKit.Note>
              <TicketRequestFormKit.Submit loading={state.isSubmitting}>
                {ticketRequestSubmitLabel}
              </TicketRequestFormKit.Submit>
              <TicketRequestFormKit.SubmitHint>
                {ticketRequestSubmitDisabledHint}
              </TicketRequestFormKit.SubmitHint>
              <TicketRequestFormKit.Note>{ticketRequestSubmitNote}</TicketRequestFormKit.Note>
            </TicketRequestFormKit.Summary>
            {submitError}
          </TicketRequestFormKit.Aside>
        </TicketRequestFormKit.Columns>
      </TicketRequestFormKit>
    </KkSection>
  );
};
