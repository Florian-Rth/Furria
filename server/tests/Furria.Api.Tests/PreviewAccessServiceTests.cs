using Furria.Application.PreviewAccess;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests;

public sealed class PreviewAccessServiceTests
{
    [Fact]
    public void Should_DenyEveryPassword_When_NoPasswordIsConfigured()
    {
        var service = new PreviewAccessService(Options.Create(new PreviewAccessOptions()));

        Assert.False(service.ValidatePassword("anything"));
        Assert.False(service.ValidatePassword(""));
    }
}
