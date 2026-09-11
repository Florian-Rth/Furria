using Furria.Application.Results;
using Xunit;

namespace Furria.Api.Tests.Results;

public sealed class ResultTests
{
    private const string Message = "Die Mitgliedschaft laeuft bereits.";

    [Fact]
    public void Should_CarryNoError_When_TheResultSucceeded()
    {
        var result = Result.Success();

        Assert.True(result.IsSuccess);
        Assert.Throws<InvalidOperationException>(() => result.Error);
    }

    [Theory]
    [InlineData(ResultErrorKind.NotFound)]
    [InlineData(ResultErrorKind.Conflict)]
    [InlineData(ResultErrorKind.Validation)]
    [InlineData(ResultErrorKind.Forbidden)]
    [InlineData(ResultErrorKind.Unauthorized)]
    public void Should_CarryTheKindAndTheMessage_When_TheResultFailed(ResultErrorKind kind)
    {
        var result = Failed(kind);

        Assert.False(result.IsSuccess);
        Assert.Equal(kind, result.Error.Kind);
        Assert.Equal(Message, result.Error.Message);
    }

    [Fact]
    public void Should_SeparateCredentialsFromPermission_When_AFailureIsBuilt()
    {
        Assert.Equal(ResultErrorKind.Unauthorized, Result.Unauthorized(Message).Error.Kind);
        Assert.Equal(ResultErrorKind.Forbidden, Result.Forbidden(Message).Error.Kind);
        Assert.Equal(ResultErrorKind.Forbidden, Result<int>.Forbidden(Message).Error.Kind);
    }

    private static Result Failed(ResultErrorKind kind) =>
        kind switch
        {
            ResultErrorKind.NotFound => Result.NotFound(Message),
            ResultErrorKind.Conflict => Result.Conflict(Message),
            ResultErrorKind.Validation => Result.Validation(Message),
            ResultErrorKind.Forbidden => Result.Forbidden(Message),
            ResultErrorKind.Unauthorized => Result.Unauthorized(Message),
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, "Unknown kind."),
        };
}
