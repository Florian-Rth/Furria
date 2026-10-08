using Furria.Infrastructure.Identity;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class CredentialChangeNotifierTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public CredentialChangeNotifierTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Refuse_When_NoTransactionHoldsTheChangeItReports()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        await using var scope = _fixture.Services.CreateAsyncScope();
        var notifier = scope.ServiceProvider.GetRequiredService<CredentialChangeNotifier>();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            notifier.NotifyAsync(
                _fixture.ManagingLogin.AccountId,
                CredentialChange.PasswordChanged,
                toAddress: null,
                ct
            )
        );
    }
}
