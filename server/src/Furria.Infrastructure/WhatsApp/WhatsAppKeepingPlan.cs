using System.Diagnostics.Contracts;
using Furria.Application.WhatsApp;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppKeepingPlan
{
    public const int MostAddsPerPass = 3;

    [Pure]
    public static IReadOnlyList<WhatsAppKeepingStep> Of(
        IEnumerable<WhatsAppKeepingCandidate> candidates,
        IReadOnlySet<string> digitsInGroup
    )
    {
        var unsettled = candidates
            .OrderBy(candidate => candidate.PersonId)
            .Select(candidate =>
                (
                    candidate.PersonId,
                    Digits: WhatsAppPhoneNumbers.InternationalDigitsOf(candidate.Phone),
                    candidate.HeldDigits,
                    candidate.HeldState
                )
            )
            .Where(candidate =>
                candidate.Digits is not null
                && !(
                    candidate.Digits == candidate.HeldDigits
                    && candidate.HeldState == WhatsAppGroupAddState.InGroup
                )
            )
            .ToList();

        return
        [
            .. unsettled
                .Where(candidate => digitsInGroup.Contains(candidate.Digits!))
                .Select(candidate => new WhatsAppKeepingStep(
                    candidate.PersonId,
                    candidate.Digits!,
                    WhatsAppGroupAddState.InGroup
                )),
            .. unsettled
                .Where(candidate =>
                    !digitsInGroup.Contains(candidate.Digits!)
                    && candidate.Digits != candidate.HeldDigits
                )
                .DistinctBy(candidate => candidate.Digits)
                .Take(MostAddsPerPass)
                .Select(candidate => new WhatsAppKeepingStep(
                    candidate.PersonId,
                    candidate.Digits!,
                    WhatsAppGroupAddState.Requested
                )),
        ];
    }

    [Pure]
    public static string ParticipantIdOf(string phoneDigits) =>
        phoneDigits + WhatsAppSenders.PhoneServer;
}
