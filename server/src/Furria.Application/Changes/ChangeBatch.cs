namespace Furria.Application.Changes;

public sealed record ChangeBatch
{
    public static readonly ChangeBatch Everything = new() { Changes = [], IsEverything = true };

    public required IReadOnlyList<DomainChange> Changes { get; init; }

    public bool IsEverything { get; init; }
}
