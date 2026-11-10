namespace Furria.Application.Club;

public sealed record CalendarSignUpListInput
{
    public required int? SignUpListId { get; init; }

    public required string Title { get; init; }

    public required string? Hint { get; init; }

    public required DateTimeOffset? SignUpUntil { get; init; }
}
