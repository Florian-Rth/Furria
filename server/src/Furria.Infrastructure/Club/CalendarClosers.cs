using System.Diagnostics.Contracts;
using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

internal static class CalendarClosers
{
    [Pure]
    public static CalendarCloser? Of(string? firstName, string? lastName) =>
        firstName is null || lastName is null ? null : new CalendarCloser(firstName, lastName);
}
