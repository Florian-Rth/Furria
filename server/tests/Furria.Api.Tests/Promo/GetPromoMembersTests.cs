using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Promo;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Promo;

public sealed class GetPromoMembersTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetPromoMembersTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListOnlyAffiliatedPersonsWithAnEnabledAccount_When_OthersAreDisabledUnaffiliatedOrWithoutAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddAccount("alice")
                        .AddMembership("alice-membership", "alice")
                        .AddAccount("bert")
                        .AddMembership("bert-membership", "bert")
                        .AddAccount("carla", disabled: true)
                        .AddMembership("carla-membership", "carla")
                        .AddPerson("dora")
                        .AddMembership("dora-membership", "dora")
                        .AddAccount("emil")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetPromoMembers, GetPromoMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            new[]
            {
                ctx.Identity.Accounts.IdOf("alice"),
                ctx.Identity.Accounts.IdOf("bert"),
            }.Order(),
            result.Members.Select(member => member.AccountId).Order()
        );
        Assert.Equal(ApiTestFixture.WebsiteBaseUrl, result.WebsiteUrl);
    }

    [Fact]
    public async Task Should_ListNeverRedeemedFirstThenByArrivalWithOnlyTheLastInitial_When_MembersArrivedAtDifferentTimes()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Müller")
                        .AddAccount("anna", redeemedAt: now.AddHours(-1))
                        .AddMembership("anna-membership", "anna")
                        .AddPerson("ben", "Ben", "özdemir")
                        .AddAccount("ben", redeemedAt: now.AddDays(-30))
                        .AddMembership("ben-membership", "ben")
                        .AddAccount("cleo", redeemedAt: now.AddHours(-1))
                        .AddMembership("cleo-membership", "cleo")
                        .AddAccount("host")
                        .AddMembership("host-membership", "host")
                        .AddAccount("olaf")
                        .AddMembership("olaf-membership", "olaf")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("host", ct);
        var (response, result) = await client.GETAsync<GetPromoMembers, GetPromoMembersResponse>();

        int[] expectedOrder =
        [
            .. new[]
            {
                ctx.Identity.Accounts.IdOf("host"),
                ctx.Identity.Accounts.IdOf("olaf"),
            }.Order(),
            ctx.Identity.Accounts.IdOf("ben"),
            .. new[]
            {
                ctx.Identity.Accounts.IdOf("anna"),
                ctx.Identity.Accounts.IdOf("cleo"),
            }.Order(),
        ];
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(expectedOrder, result.Members.Select(member => member.AccountId));
        var anna = Assert.Single(
            result.Members,
            member => member.AccountId == ctx.Identity.Accounts.IdOf("anna")
        );
        Assert.Equal("Anna", anna.FirstName);
        Assert.Equal("M", anna.LastInitial);
        Assert.Equal(now.AddHours(-1), anna.ArrivedAt);
        var ben = Assert.Single(
            result.Members,
            member => member.AccountId == ctx.Identity.Accounts.IdOf("ben")
        );
        Assert.Equal("Ö", ben.LastInitial);
        var host = Assert.Single(
            result.Members,
            member => member.AccountId == ctx.Identity.Accounts.IdOf("host")
        );
        Assert.Null(host.ArrivedAt);
    }
}
