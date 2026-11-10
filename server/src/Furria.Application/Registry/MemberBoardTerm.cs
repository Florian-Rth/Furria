using Furria.Core.Club;

namespace Furria.Application.Registry;

public sealed record MemberBoardTerm
{
    public required int BoardOfficeId { get; init; }

    public required string Office { get; init; }

    public required ClubIcon? Icon { get; init; }

    public required DateOnly Since { get; init; }

    public required DateOnly? Until { get; init; }
}
