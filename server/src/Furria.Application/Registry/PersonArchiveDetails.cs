using Furria.Application.Groups;

namespace Furria.Application.Registry;

public sealed record PersonArchiveDetails
{
    public required DateOnly ArchivedOn { get; init; }

    public required PersonReference? ArchivedBy { get; init; }
}
