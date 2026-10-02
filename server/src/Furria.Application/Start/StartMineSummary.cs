using Furria.Core.Groups;

namespace Furria.Application.Start;

public sealed record StartMineSummary
{
    public required StartMineKind Kind { get; init; }

    public required int? SubjectId { get; init; }

    public required DateOnly On { get; init; }

    public required DateOnly Until { get; init; }

    public required string? Name { get; init; }

    public required GroupTone? GroupTone { get; init; }

    public required string? Function { get; init; }

    public required StartPersonRef? ChangedBy { get; init; }

    public required int? SessionStartYear { get; init; }

    public required int? Years { get; init; }

    public required IReadOnlyList<string>? PermissionKeys { get; init; }
}
