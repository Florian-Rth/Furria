using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

public sealed partial class AnnouncementService
{
    private sealed record SummariesReader(MentionReader Mentions, AddOnsReader AddOns);

    private sealed record AddOnsReader(
        int? PersonId,
        bool MayPostAnnouncements,
        AddOnsLender Lender
    )
    {
        [Pure]
        public static AddOnsReader Of(AnnouncementReader reader) =>
            new(
                reader.Mentions.PersonId,
                reader.MayPostAnnouncements,
                new AccountLender(reader.AccountId)
            );
    }

    private abstract record AddOnsLender;

    private sealed record AccountLender(int AccountId) : AddOnsLender;

    private sealed record PersonLender(int PersonId, CalendarRights Rights) : AddOnsLender;
}
