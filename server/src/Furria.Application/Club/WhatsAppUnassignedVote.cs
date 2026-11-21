namespace Furria.Application.Club;

public sealed record WhatsAppUnassignedVote
{
    public required string? WhatsAppName { get; init; }

    public required string? Phone { get; init; }

    public required IReadOnlyList<int> OptionIds { get; init; }
}
