using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class GetPersonSearchTests : IClassFixture<ApiTestFixture>
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
    public async Task Should_LeaveOutAnArchivedPerson_When_HerNameMatches()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("pia", "Pia", "Brendel")
                        .AddArchive("pia", new DateOnly(2021, 1, 1))
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await SearchAsync(client, "bren");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Identity.People.IdOf("paula")],
            result.Persons.Select(person => person.PersonId)
        );
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
