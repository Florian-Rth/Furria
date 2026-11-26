namespace Furria.Infrastructure.Assistant;

public sealed record GroupFact(
    string Name,
    string? Kind,
    string Description,
    int? FoundedYear,
    bool IsRecruiting,
    int MemberCount,
    bool IsMine
);
