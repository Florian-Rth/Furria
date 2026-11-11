using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class PutAdmissionAgesTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutAdmissionAgesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReplaceTheTickedBands_When_TheGroupAdminSavesThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .GroupMatcher(matcher =>
                        matcher.AddAdmissionAge("tanzgarde", AdmissionAgeBand.UnderTwelve)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutAdmissionAges, PutAdmissionAgesRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                AdmissionAges =
                [
                    AdmissionAgeBand.SixteenToSeventeen,
                    AdmissionAgeBand.EighteenPlus,
                    AdmissionAgeBand.EighteenPlus,
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.AdmissionAgesOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeExactly(AdmissionAgeBand.SixteenToSeventeen, AdmissionAgeBand.EighteenPlus)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClearEveryBand_When_TheGroupAdminUnticksAll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .GroupMatcher(matcher =>
                        matcher
                            .AddAdmissionAge("tanzgarde", AdmissionAgeBand.UnderTwelve)
                            .AddAdmissionAge("tanzgarde", AdmissionAgeBand.EighteenPlus)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutAdmissionAges, PutAdmissionAgesRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde"), AdmissionAges = [] }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.AdmissionAgesOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeExactly()
            .AssertAsync(ct);
    }
}
