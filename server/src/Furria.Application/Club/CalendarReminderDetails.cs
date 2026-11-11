namespace Furria.Application.Club;

public sealed record CalendarReminderDetails
{
    public required DateTimeOffset? LastRemindedAt { get; init; }

    public required DateTimeOffset? RemindableFrom { get; init; }
}
