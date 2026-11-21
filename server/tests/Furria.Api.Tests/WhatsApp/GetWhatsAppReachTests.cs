using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class GetWhatsAppReachTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChat = "120363001@g.us";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private readonly ApiTestFixture _fixture;

    public GetWhatsAppReachTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Should_TellWhetherNotifyingReachesTheClubGroup_When_AMemberWrites(
        bool clubGroupLinked
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("bea", "Bea", "Aushang")
                        .AddAccount("bea")
                        .AddMembership("bea-first", "bea", JoinedIn2017)
                ),
            ct
        );
        if (clubGroupLinked)
            await _fixture.LinkClubWhatsAppGroupAsync(ClubChat, ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (_, result) = await client.GETAsync<GetWhatsAppReach, GetWhatsAppReachResponse>();

        Assert.Equal(clubGroupLinked, result.ClubGroup);
    }
}
