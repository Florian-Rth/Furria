using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class AttendanceResponseChange
{
    public int Id { get; set; }

    public int CalendarEntryId { get; set; }

    public int PersonId { get; set; }

    public AttendanceAnswer Answer { get; set; }

    public bool IsRecordedOnBehalf { get; set; }

    public int? RecordedByPersonId { get; set; }

    public DateTimeOffset RecordedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public Person? Person { get; set; }

    public Person? RecordedBy { get; set; }
}
