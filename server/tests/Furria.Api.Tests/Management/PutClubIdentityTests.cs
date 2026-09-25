using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class PutClubIdentityTests
{
    private const string ValidationField = "request";
    private const string FoundedYearField = "foundedYear";
    private const string OfficialName = "Großfurraer Carnevals Club e.V.";

    private readonly ApiTestFixture _fixture;

    public PutClubIdentityTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteTheIdentity_When_TheClubHasWrittenNothingYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = OfficialName,
                ShortName = "GCC",
                FoundedYear = 1971,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveName(OfficialName)
            .ClubRecord()
            .ToHaveShortName("GCC")
            .ClubRecord()
            .ToHaveFoundedYear(1971)
            .ClubRecord()
            .ToHaveAgeOfConsent(16)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheOtherSectionsAlone_When_TheIdentityIsRewritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Alter Name",
                        email: "vorstand@furria.de",
                        ageOfConsent: 14
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = OfficialName,
                ShortName = null,
                FoundedYear = 1971,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveName(OfficialName)
            .ClubRecord()
            .ToHaveEmail("vorstand@furria.de")
            .ClubRecord()
            .ToHaveAgeOfConsent(14)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ForgetTheNames_When_OnlyBlanksAreSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.SetClubRecord(name: OfficialName)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = "   ",
                ShortName = "",
                FoundedYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveName(null)
            .ClubRecord()
            .ToHaveShortName(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TrimTheName_When_ItIsSentWithSurroundingBlanks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = $"  {OfficialName} ",
                ShortName = null,
                FoundedYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.ClubRecord().ToHaveName(OfficialName).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsLongerThanTheColumn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = new string('a', 161),
                ShortName = null,
                FoundedYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
    }

    [Theory]
    [InlineData(1799)]
    [InlineData(2101)]
    public async Task Should_ReturnBadRequest_When_TheFoundedYearLiesOutsideTheRange(
        int foundedYear
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.SetClubRecord(foundedYear: 1971)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = null,
                ShortName = null,
                FoundedYear = foundedYear,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Das Gründungsjahr liegt zwischen 1800 und 2100."],
            failures[FoundedYearField]
        );
        await ctx.Expected.ClubRecord().ToHaveFoundedYear(1971).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheYear_When_TheFoundingLiesInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.SetClubRecord(foundedYear: 1971)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = null,
                ShortName = null,
                FoundedYear = _fixture.Today.Year + 1,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Das Gründungsjahr liegt in der Zukunft."], failures[ValidationField]);
        await ctx.Expected.ClubRecord().ToHaveFoundedYear(1971).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsAnotherManagementPermission()
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
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = OfficialName,
                ShortName = null,
                FoundedYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
                new()
                {
                    Name = OfficialName,
                    ShortName = null,
                    FoundedYear = null,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
