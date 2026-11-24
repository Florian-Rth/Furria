using System.Net;
using System.Net.Http.Headers;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Application.Assistant;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class PutClubAssistantTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutClubAssistantTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseSwitchingOn_When_NoModelKeyIsConfigured()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await using var host = _fixture.HostWithSettings(
            new Dictionary<string, string>
            {
                [$"{ClubAssistantOptions.SectionName}:{nameof(ClubAssistantOptions.ApiKey)}"] = "",
            }
        );
        var session = await ctx.Identity.LogInAsync(
            ctx.Identity.ManagingLogin.Email,
            ctx.Identity.ManagingLogin.Password,
            ct
        );
        var client = host.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            session.AccessToken
        );

        var response = await client.PUTAsync<PutClubAssistant, PutClubAssistantRequest>(
            new()
            {
                IsEnabled = true,
                MonthlyBudgetEuros = 10m,
                QuestionsPerPersonPerDay = 30,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_StopModelCalls_When_TheBudgetIsLoweredBelowWhatWasUsed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await _fixture.BookClubAssistantCallAsync(new(0, 0, 500_000), ct);

        await client.PUTAsync<PutClubAssistant, PutClubAssistantRequest>(
            new()
            {
                IsEnabled = true,
                MonthlyBudgetEuros = 2m,
                QuestionsPerPersonPerDay = 30,
            }
        );

        Assert.False(await _fixture.ClubAssistantHasBudgetLeftAsync(ct));
    }
}
