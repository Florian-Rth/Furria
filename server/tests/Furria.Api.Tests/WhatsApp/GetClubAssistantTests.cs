using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Core.Assistant;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class GetClubAssistantTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset LastOctoberEveningInBerlin = new(
        2026,
        10,
        31,
        22,
        30,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset FirstNovemberNightInBerlin = new(
        2026,
        10,
        31,
        23,
        30,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset MidNovember = new(2026, 11, 15, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetClubAssistantTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CountOnlyCallsOfTheClubsMonth_When_CallsSpanAMonthBoundary()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        _fixture.TimeProvider.SetUtcNow(LastOctoberEveningInBerlin);
        await _fixture.BookClubAssistantCallAsync(new ClubAssistantTokens(1_000_000, 0, 0), ct);
        _fixture.TimeProvider.SetUtcNow(FirstNovemberNightInBerlin);
        await _fixture.BookClubAssistantCallAsync(
            new ClubAssistantTokens(2_000_000, 1_000_000, 500_000),
            ct
        );
        _fixture.TimeProvider.SetUtcNow(MidNovember);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, assistant) = await client.GETAsync<GetClubAssistant, GetClubAssistantResponse>();

        Assert.Equal(3.1m, assistant.UsedThisMonthEuros);
    }
}
