using System.Diagnostics.Contracts;

namespace Furria.Core.Push;

public static class PushTopics
{
    private static readonly (PushTopic Topic, Func<PushListener, bool> Hears)[] Audiences =
    [
        (PushTopic.Invitations, listener => listener.IsCalendarAudience),
        (PushTopic.Changes, listener => listener.IsCalendarAudience),
        (
            PushTopic.Reminders,
            listener => listener.IsCalendarAudience || listener.ReadsAnnouncements
        ),
        (PushTopic.Announcements, listener => listener.ReadsAnnouncements),
        (PushTopic.BeerTab, listener => listener.KeepsBeerTab),
        (PushTopic.BeerStock, listener => listener.ManagesBeerList),
    ];

    [Pure]
    public static IReadOnlyList<PushTopic> HeardBy(PushListener listener) =>
        [
            .. Audiences
                .Where(audience => audience.Hears(listener))
                .Select(audience => audience.Topic),
        ];
}
