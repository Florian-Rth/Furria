using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class PutClubContactTests
{
    private const string EmailField = "email";
    private const string WebsiteUrlField = "websiteUrl";

    private readonly ApiTestFixture _fixture;

    public PutClubContactTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteTheContact_When_TheClubHasWrittenNothingYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubContact, PutClubContactRequest>(FullContact());

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveAddress("Hauptstraße 1", "99706", "Großfurra")
            .ClubRecord()
            .ToHaveEmail("vorstand@furria.de")
            .ClubRecord()
            .ToHavePhone("03632 123456")
            .ClubRecord()
            .ToHaveLinks(
                "https://furria.de",
                "https://instagram.com/furria",
                "https://facebook.com/furria"
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheOtherSectionsAlone_When_TheContactIsRewritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Großfurraer Carnevals Club e.V.",
                        foundedYear: 1971,
                        ageOfConsent: 14
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubContact, PutClubContactRequest>(FullContact());

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveName("Großfurraer Carnevals Club e.V.")
            .ClubRecord()
            .ToHaveFoundedYear(1971)
            .ClubRecord()
            .ToHaveAgeOfConsent(14)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ForgetTheFacts_When_BlanksAreSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        street: "Hauptstraße 1",
                        zip: "99706",
                        city: "Großfurra",
                        email: "vorstand@furria.de",
                        websiteUrl: "https://furria.de"
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubContact, PutClubContactRequest>(
            new()
            {
                Street = " ",
                Zip = "",
                City = null,
                Email = "",
                Phone = null,
                WebsiteUrl = "",
                InstagramUrl = null,
                FacebookUrl = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveAddress(null, null, null)
            .ClubRecord()
            .ToHaveEmail(null)
            .ClubRecord()
            .ToHaveLinks(null, null, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheEmailIsNoAddress()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubContact, PutClubContactRequest>(
            FullContact() with
            {
                Email = "vorstand",
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.True(failures.ContainsKey(EmailField));
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
    }

    [Theory]
    [InlineData("furria.de")]
    [InlineData("ftp://furria.de")]
    [InlineData("javascript:alert(1)")]
    public async Task Should_ReturnBadRequest_When_TheWebsiteIsNoWebLink(string websiteUrl)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutClubContact, PutClubContactRequest>(
            FullContact() with
            {
                WebsiteUrl = websiteUrl,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Gib eine vollständige Adresse mit https:// ein."],
            failures[WebsiteUrlField]
        );
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
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
        var response = await client.PUTAsync<PutClubContact, PutClubContactRequest>(FullContact());

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
            .PUTAsync<PutClubContact, PutClubContactRequest>(FullContact());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
    }

    private static PutClubContactRequest FullContact() =>
        new()
        {
            Street = "Hauptstraße 1",
            Zip = "99706",
            City = "Großfurra",
            Email = "vorstand@furria.de",
            Phone = "03632 123456",
            WebsiteUrl = "https://furria.de",
            InstagramUrl = "https://instagram.com/furria",
            FacebookUrl = "https://facebook.com/furria",
        };

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
