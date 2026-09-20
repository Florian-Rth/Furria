namespace Furria.Application.Club;

public sealed record CreateSessionRecordCommand
{
    public required int StartYear { get; init; }

    public required int? Number { get; init; }

    public required string? Motto { get; init; }

    public required string? LogoSvg { get; init; }
}
