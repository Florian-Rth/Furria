using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class GetClubRecordTests
{
    private const int TheDefaultAgeOfConsent = 16;

    private readonly ApiTestFixture _fixture;

    public GetClubRecordTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnTheRecordedFacts_When_TheClubHasWrittenThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Großfurraer Carnevals Club e.V.",
                        foundedYear: 1971,
                        street: "Hauptstraße 1",
                        zip: "99706",
                        city: "Großfurra",
                        email: "vorstand@furria.de",
                        websiteUrl: "https://furria.de",
                        ageOfConsent: 14
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetClubRecord, GetClubRecordResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            (
                "Großfurraer Carnevals Club e.V.",
                1971,
                "Hauptstraße 1",
                "99706",
                "Großfurra",
                "vorstand@furria.de",
                "https://furria.de",
                14
            ),
            (
                result.Name,
                result.FoundedYear,
                result.Street,
                result.Zip,
                result.City,
                result.Email,
                result.WebsiteUrl,
                result.AgeOfConsent
            )
        );
    }

    [Fact]
    public async Task Should_ReturnNoFactsAndTheDefaultAge_When_TheClubHasWrittenNothingYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetClubRecord, GetClubRecordResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.Name);
        Assert.Null(result.FoundedYear);
        Assert.Null(result.Email);
        Assert.Equal(TheDefaultAgeOfConsent, result.AgeOfConsent);
    }

    [Fact]
    public async Task Should_ReturnOk_When_TheCallerOnlyHoldsClubManage()
    {
        var response = await AskAsHolderOfAsync(FurriaPermissions.ClubManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsAnotherManagementPermission()
    {
        var response = await AskAsHolderOfAsync(FurriaPermissions.PersonsManage);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetClubRecord, GetClubRecordResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task<HttpResponseMessage> AskAsHolderOfAsync(string permissionKey)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "teilpflege",
                            "ilka-teilpflege",
                            "Teilpflege",
                            "ilka",
                            permissionKey
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<GetClubRecord, GetClubRecordResponse>();

        return response;
    }
}
