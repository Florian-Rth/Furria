using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class GetPersonSearchTests
{
    private readonly ApiTestFixture _fixture;

    public GetPersonSearchTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetPersonSearchResponse>> SearchAsync(
        HttpClient client,
        string query
    ) =>
        client.GETAsync<GetPersonSearch, GetPersonSearchRequest, GetPersonSearchResponse>(
            new GetPersonSearchRequest { Query = query }
        );

    [Fact]
    public async Task Should_FindThePerson_When_SheHasNoClubTieAtAll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "bren");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(result.Persons);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        Assert.Equal("Paula", paula.FirstName);
        Assert.Equal("Brendel", paula.LastName);
    }

    [Fact]
    public async Task Should_FindTheUmlautName_When_TheQueryArrivesFolded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "muller");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Identity.People.IdOf("mueller-umlaut")],
            result.Persons.Select(person => person.PersonId)
        );
    }

    [Fact]
    public async Task Should_FindBothSpellings_When_TheQueryCarriesTheUmlaut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "müller");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Identity.People.IdOf("mueller-written"),
                ctx.Identity.People.IdOf("mueller-umlaut"),
            ],
            result.Persons.Select(person => person.PersonId)
        );
    }

    [Fact]
    public async Task Should_MatchTheWholeName_When_TheQuerySpansFirstAndLastName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "Anna Kai");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Identity.People.IdOf("anna")],
            result.Persons.Select(person => person.PersonId)
        );
    }

    [Fact]
    public async Task Should_SortUmlautsAsGerman_When_SeveralPersonsMatch()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("zimmermann", "Probe", "Zimmermann")
                            .AddPerson("kuehnel", "Probe", "Kühnel")
                            .AddPerson("kuhn", "Probe", "Kuhn")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "probe");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Identity.People.IdOf("kuhn"),
                ctx.Identity.People.IdOf("kuehnel"),
                ctx.Identity.People.IdOf("zimmermann"),
            ],
            result.Persons.Select(person => person.PersonId)
        );
    }

    [Fact]
    public async Task Should_ReturnAtMostTwentyFiveRows_When_TheRegisterOverflowsTheCap()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                    {
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna");
                        for (var index = 0; index < 30; index++)
                        {
                            identity.AddPerson(
                                $"suchtreffer-{index}",
                                "Test",
                                $"Suchtreffer{index:D2}"
                            );
                        }
                    })
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "suchtreffer");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(25, result.Persons.Count);
        Assert.Equal("Suchtreffer00", result.Persons[0].LastName);
        Assert.Equal("Suchtreffer24", result.Persons[^1].LastName);
    }

    [Fact]
    public async Task Should_ReturnAnEmptyList_When_NoNameMatches()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "zzzz");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Persons);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerPutsNobodyIntoAnything()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var (response, _) = await SearchAsync(client, "bren");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_AllowTheSearch_When_TheCallerHoldsRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("katrin")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "rechtepflege",
                            "rechtepflege-holding",
                            "Rechtepflege",
                            "katrin",
                            FurriaPermissions.RolesManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var (response, result) = await SearchAsync(client, "bren");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Identity.People.IdOf("paula")],
            result.Persons.Select(person => person.PersonId)
        );
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheQueryIsASingleCharacter()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await SearchAsync(client, "b");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await BuildSearchableRegistryAsync(ct);

        var (response, _) = await SearchAsync(_fixture.CreateClient(), "bren");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryTheNameAndTheIdOnly_When_ThePayloadIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var payload = await client.GetStringAsync("/api/person-search?q=bren", ct);

        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            ["persons"],
            document.RootElement.EnumerateObject().Select(field => field.Name)
        );
        var paula = document.RootElement.GetProperty("persons").EnumerateArray().Single();
        Assert.Equal(
            ["personId", "firstName", "lastName"],
            paula.EnumerateObject().Select(field => field.Name)
        );
        Assert.Equal("Brendel", paula.GetProperty("lastName").GetString());
    }

    [Fact]
    public async Task Should_FindNobody_When_TheQueryIsAWildcard()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "%a");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Persons);
    }

    [Fact]
    public async Task Should_FindOnlyTheLiteralName_When_TheQueryCarriesAnUnderscore()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("kunstname", "Kim", "Meier_Schulz")
                            .AddPerson("buergerlich", "Kim", "MeierzSchulz")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "meier_schulz");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Identity.People.IdOf("kunstname")],
            result.Persons.Select(person => person.PersonId)
        );
    }

    [Fact]
    public async Task Should_FindThePerson_When_TheQueryCarriesATrailingSpace()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildSearchableRegistryAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await SearchAsync(client, "Brendel ");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Identity.People.IdOf("paula")],
            result.Persons.Select(person => person.PersonId)
        );
    }

    private Task<SeededContext> BuildSearchableRegistryAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("mueller-umlaut", "Rita", "Müller")
                            .AddPerson("mueller-written", "Jens", "Mueller")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );
}
