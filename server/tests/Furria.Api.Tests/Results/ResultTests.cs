using Furria.Application.Results;
using Xunit;

namespace Furria.Api.Tests.Results;

public sealed class ResultTests
{
    private const string Message = "Die Mitgliedschaft laeuft bereits.";

    [Fact]
    public void Should_SeparateCredentialsFromPermission_When_AFailureIsBuilt()
    {
        Assert.Equal(ResultErrorKind.Unauthorized, Result.Unauthorized(Message).Error.Kind);
        Assert.Equal(ResultErrorKind.Forbidden, Result.Forbidden(Message).Error.Kind);
        Assert.Equal(ResultErrorKind.Forbidden, Result<int>.Forbidden(Message).Error.Kind);
    }
}
