using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class CalendarEntryAudiencePerson : ITimestamped
{
    public int Id { get; set; }

    public int CalendarEntryId { get; set; }

    public int PersonId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public Person? Person { get; set; }
}
