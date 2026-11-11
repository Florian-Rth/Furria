namespace Furria.Application.Club;

public sealed record CalendarSignUpLineDetails
{
    public required int LineId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Text { get; init; }

    public required bool ByViewer { get; init; }
}
