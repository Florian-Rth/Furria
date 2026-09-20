namespace Furria.Application.Club;

public sealed record BoardOfficeImpliedRoleCommand
{
    public required int BoardOfficeId { get; init; }

    public required int? ImpliedRoleId { get; init; }
}
