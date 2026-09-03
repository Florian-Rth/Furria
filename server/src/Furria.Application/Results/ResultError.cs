namespace Furria.Application.Results;

public sealed record ResultError
{
    public required ResultErrorKind Kind { get; init; }

    public required string Message { get; init; }
}
