namespace Furria.Infrastructure.Club;

internal sealed record CalendarEntryAddOnHost(
    int CalendarEntryId,
    int? OwnerGroupId,
    DateTimeOffset StartsAt
) : AddOnHost
{
    public override DateTimeOffset? ClosesAt => StartsAt;
}
