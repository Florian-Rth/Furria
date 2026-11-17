using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private static readonly IReadOnlySet<int> NobodySkipped = new HashSet<int>();

    public async Task<Result<int>> NotifyReachAsync(
        CalendarNotifyReachQuery query,
        CancellationToken ct
    )
    {
        var audience = AudienceChoice.Of(
            query.Audience,
            query.AudienceGroupIds,
            query.AudiencePersonIds
        );

        if (!await MayAddressAsync(query.ActorAccountId, audience, NoHeldAudience, ct))
            return Result<int>.Forbidden(BeyondOwnGroupsMessage);

        var now = _timeProvider.GetUtcNow();
        var recipients = await _pushRecipients.ReachedAsync(
            new CalendarPushReach
            {
                Reason = CalendarPushReason.Announced,
                Entry = AnnouncedFactsOf(query.Kind, audience, now),
                ActorPersonId = query.ActorPersonId,
                AddressedPersonIds = [],
                SkippedPersonIds = NobodySkipped,
                Today = ClubClock.DayOf(now),
            },
            ct
        );

        return Result<int>.Success(
            recipients.Select(recipient => recipient.PersonId).Distinct().Count()
        );
    }

    [Pure]
    private static CalendarEntryFacts AnnouncedFactsOf(
        CalendarEntryKind kind,
        AudienceChoice audience,
        DateTimeOffset startsAt
    ) =>
        new()
        {
            OwnerGroupId = null,
            ParticipatingGroupIds = [],
            Audience = audience.Audience,
            AudienceGroupIds = audience.GroupIds,
            AudiencePersonIds = audience.PersonIds,
            Kind = kind,
            AsksForResponse = false,
            StartsAt = startsAt,
        };
}
