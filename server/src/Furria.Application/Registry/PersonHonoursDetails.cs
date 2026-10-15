namespace Furria.Application.Registry;

public sealed record PersonHonoursDetails
{
    public static readonly PersonHonoursDetails None = new() { Sessions = 0, Functions = [] };

    public required int Sessions { get; init; }

    public required IReadOnlyList<PersonFunctionDetails> Functions { get; init; }
}
