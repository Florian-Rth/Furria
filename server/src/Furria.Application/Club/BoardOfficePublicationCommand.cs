namespace Furria.Application.Club;

public sealed record BoardOfficePublicationCommand
{
    public required int BoardOfficeId { get; init; }

    public required bool IsPublic { get; init; }
}
