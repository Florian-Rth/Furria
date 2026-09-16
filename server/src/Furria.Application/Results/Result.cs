namespace Furria.Application.Results;

public readonly record struct Result
{
    private readonly ResultError? _error;

    public bool IsSuccess => _error is null;

    public ResultError Error =>
        _error ?? throw new InvalidOperationException("A successful result carries no error.");

    private Result(ResultError? error)
    {
        _error = error;
    }

    public override string ToString() => IsSuccess ? "Success" : $"{Error.Kind}({Error.Message})";

    public static Result Success() => new(null);

    public static Result NotFound(string message) => Failed(ResultErrorKind.NotFound, message);

    public static Result Conflict(string message) => Failed(ResultErrorKind.Conflict, message);

    public static Result Validation(string message) => Failed(ResultErrorKind.Validation, message);

    public static Result Unauthorized(string message) =>
        Failed(ResultErrorKind.Unauthorized, message);

    public static Result Forbidden(string message) => Failed(ResultErrorKind.Forbidden, message);

    private static Result Failed(ResultErrorKind kind, string message) =>
        new(new ResultError { Kind = kind, Message = message });
}
