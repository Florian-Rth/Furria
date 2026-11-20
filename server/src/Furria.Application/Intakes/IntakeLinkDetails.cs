namespace Furria.Application.Intakes;

public sealed record IntakeLinkDetails
{
    public required int IntakeId { get; init; }

    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
