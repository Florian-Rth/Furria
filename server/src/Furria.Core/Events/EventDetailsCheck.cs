using System.Diagnostics.Contracts;

namespace Furria.Core.Events;

public static class EventDetailsCheck
{
    [Pure]
    public static IReadOnlyList<MissingEventDetail> MissingOf(EventDetailsFacts facts) =>
        [
            .. MissingBeforePublishingOf(facts),
            .. Unless(facts.IsPublished, MissingEventDetail.Published),
        ];

    [Pure]
    public static IReadOnlyList<MissingEventDetail> MissingBeforePublishingOf(
        EventDetailsFacts facts
    ) =>
        [
            .. Unless(facts.HasVenue, MissingEventDetail.Venue),
            .. Unless(facts.HasDoorsOpenAt, MissingEventDetail.DoorsOpenAt),
            .. Unless(facts.HasDescription, MissingEventDetail.Description),
            .. Unless(facts.HasPicture, MissingEventDetail.Picture),
        ];

    [Pure]
    private static MissingEventDetail[] Unless(bool isSet, MissingEventDetail detail) =>
        isSet ? [] : [detail];
}
