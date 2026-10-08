import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { SiteFormFallback } from '@/components/SiteForm/site-form-types';
import { useClubEmail } from '@/lib/public-club/use-club-email';
import { publicEventKeys } from '@/lib/public-events/api';
import type { EventDetail } from '@/lib/public-events/schemas';
import type { TicketRequestForm } from '../schemas';
import { EMPTY_TICKET_REQUEST, TicketRequestFormSchema } from '../schemas';
import {
  usePreparedTicketRequestAltchaProof,
  useSubmitTicketRequestMutation,
} from '../ticket-request-api';
import { ticketRequestFallbackLabel, ticketRequestFallbackLead } from '../ticket-request-content';
import type { TicketRequestSummaryRow } from '../ticket-request-display';
import { buildTicketRequestSummaryRows } from '../ticket-request-display';
import type { TicketRequestFailure } from '../ticket-request-failure';
import { toTicketRequestFailure } from '../ticket-request-failure';
import { buildTicketRequestFallbackHref } from '../ticket-request-fallback';
import { isTicketRequestWindowOpen } from '../ticket-request-window';

export interface SubmittedTicketRequest {
  ticketCount: number;
  email: string;
}

export interface TicketRequestFormState {
  form: UseFormReturn<TicketRequestForm>;
  isWindowOpen: boolean;
  summaryRows: TicketRequestSummaryRow[];
  submit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitError: string | null;
  fallback: SiteFormFallback | null;
  submitted: SubmittedTicketRequest | null;
}

const markFieldFailures = (
  form: UseFormReturn<TicketRequestForm>,
  failure: TicketRequestFailure | null,
): void => {
  failure?.fields.forEach((field, index) => {
    form.setError(
      field.name,
      { type: 'server', message: field.message },
      { shouldFocus: index === 0 },
    );
  });
};

export const useTicketRequestForm = (event: EventDetail): TicketRequestFormState => {
  const [openedAt] = useState(() => new Date());
  const [isClosedByClub, setIsClosedByClub] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedTicketRequest | null>(null);
  const queryClient = useQueryClient();
  const clubEmail = useClubEmail();
  const mutation = useSubmitTicketRequestMutation();

  const form = useForm<TicketRequestForm>({
    mode: 'onTouched',
    resolver: zodResolver(TicketRequestFormSchema),
    defaultValues: EMPTY_TICKET_REQUEST,
  });

  usePreparedTicketRequestAltchaProof(
    form.formState.isDirty && !mutation.isPending && submitted === null,
  );

  const handleFormSubmit = form.handleSubmit((values) => {
    const request: SubmittedTicketRequest = {
      ticketCount: values.ticketCount,
      email: values.email,
    };

    if (values.honeypot.length > 0) {
      setSubmitted(request);
      return;
    }

    mutation.mutate(
      { eventId: event.eventId, values },
      {
        onSuccess: () => {
          setSubmitted(request);
        },
        onError: (error) => {
          const failure = toTicketRequestFailure(error);
          markFieldFailures(form, failure);

          if (failure?.closesWindow === true) {
            setIsClosedByClub(true);
            queryClient.removeQueries({ queryKey: publicEventKeys.all });
          }
        },
      },
    );
  });

  const failure = toTicketRequestFailure(mutation.error);
  const fallback: SiteFormFallback | null =
    failure?.offersMail === true && clubEmail !== null
      ? {
          lead: ticketRequestFallbackLead,
          label: ticketRequestFallbackLabel,
          href: buildTicketRequestFallbackHref(clubEmail, event, form.getValues()),
        }
      : null;

  return {
    form,
    isWindowOpen: !isClosedByClub && isTicketRequestWindowOpen(event, openedAt),
    summaryRows: buildTicketRequestSummaryRows(event, form.watch('ticketCount')),
    submit: (formEvent) => {
      void handleFormSubmit(formEvent);
    },
    isSubmitting: mutation.isPending,
    submitError: failure?.notice ?? null,
    fallback,
    submitted,
  };
};
