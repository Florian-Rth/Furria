namespace Furria.Application.Results;

public readonly record struct Result<TValue>
{
    private readonly TValue? _value;
    private readonly ResultError? _error;

    public bool IsSuccess => _error is null;

    public TValue Value =>
        IsSuccess
            ? _value!
            : throw new InvalidOperationException("A failed result carries no value.");

    public ResultError Error =>
        _error ?? throw new InvalidOperationException("A successful result carries no error.");

    private Result(TValue? value, ResultError? error)
    {
        _value = value;
        _error = error;
    }

    public override string ToString() =>
        IsSuccess ? $"Success({typeof(TValue).Name})" : $"{Error.Kind}({Error.Message})";

    public static Result<TValue> Success(TValue value) => new(value, null);

    public static Result<TValue> NotFound(string message) =>
        Failed(ResultErrorKind.NotFound, message);

    public static Result<TValue> Conflict(string message) =>
        Failed(ResultErrorKind.Conflict, message);

    public static Result<TValue> Validation(string message) =>
        Failed(ResultErrorKind.Validation, message);

    public static Result<TValue> Unauthorized(string message) =>
        Failed(ResultErrorKind.Unauthorized, message);

    public static Result<TValue> Forbidden(string message) =>
        Failed(ResultErrorKind.Forbidden, message);

    private static Result<TValue> Failed(ResultErrorKind kind, string message) =>
        new(default, new ResultError { Kind = kind, Message = message });
}
