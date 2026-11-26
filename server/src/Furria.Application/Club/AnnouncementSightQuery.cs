using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record AnnouncementSightQuery
{
    public required int PersonId { get; init; }

    public required CalendarRights Rights { get; init; }
}
