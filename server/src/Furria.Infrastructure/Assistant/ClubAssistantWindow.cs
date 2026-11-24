using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.Assistant;

public sealed record ClubAssistantWindow(DateOnly From, DateOnly To)
{
    public const int MostDays = 62;

    [Pure]
    public static ClubAssistantWindow Of(DateOnly from, DateOnly to)
    {
        var (start, end) = from <= to ? (from, to) : (to, from);
        return new ClubAssistantWindow(
            start,
            end.DayNumber - start.DayNumber >= MostDays ? start.AddDays(MostDays - 1) : end
        );
    }
}
