using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutPersonArchivedTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const int UnknownPersonId = 999_999;

    private static readonly DateOnly Joined2012 = new(2012, 11, 11);
    private static readonly DateOnly Left2019 = new(2019, 3, 31);
    private static readonly DateOnly Archived2020 = new(2020, 1, 15);

    private readonly ApiTestFixture _fixture;

    public PutPersonArchivedTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> SetArchivedAsync(
        HttpClient client,
        int personId,
        bool isArchived
    ) =>
        client.PUTAsync<PutPersonArchived, PutPersonArchivedRequest>(
            new PutPersonArchivedRequest { PersonId = personId, IsArchived = isArchived }
        );

    [Fact]
    public async Task Should_ArchiveHerTodayInTheCallersName_When_NothingOfHersRuns()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-first", "paula", Joined2012, Left2019)
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "ilka-personenpflege",
                            "Personenpflege",
                            "ilka",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, ctx.Identity.People.IdOf("ilka"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAndNameEverythingStillRunning_When_HerChainsRun()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-running", "paula", Joined2012)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("jugendgarde", "Jugendgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", Joined2012)
                            .AddGroupAdmin("paula-jugendgarde", "jugendgarde", "paula", "Trainerin")
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("kassenpruefung", "Kassenprüfung")
                            .AddRoleHolding("paula-kassenpruefung", "kassenpruefung", "paula")
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart", 3)
                            .AddBoardSeat("paula-kassenwart", "kassenwart", "paula", Joined2012)
                            .AddVenue("lager", "Lager", 2)
                            .AddKeyHolding("paula-lager", "lager", "paula", Joined2012)
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal(
            [
                "Archivieren geht erst, wenn nichts mehr läuft. Läuft noch: Mitgliedschaft · "
                    + "Gruppe Tanzgarde · Rolle Kassenprüfung · Gruppen-Admin Jugendgarde · "
                    + "Vorstandssitz Kassenwart · Schlüssel Lager.",
            ],
            (await ReadFailuresAsync(response, ct))[ConflictField]
        );
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAndNameIt_When_AChainIsDatedToBeginLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var nextMonth = _fixture.Today.AddMonths(1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Club(club =>
                        club.AddVenue("lager", "Lager")
                            .AddKeyHolding("paula-lager", "lager", "paula", nextMonth)
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal(
            ["Archivieren geht erst, wenn nichts mehr läuft. Läuft noch: Schlüssel Lager."],
            (await ReadFailuresAsync(response, ct))[ConflictField]
        );
    }

    [Fact]
    public async Task Should_ArchiveHer_When_HerOnlyOpenTiesAreInAnArchivedGroupRoleAndOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("altgarde", "Altgarde", archivedOn: Left2019)
                            .AddGroupMembership("paula-altgarde", "altgarde", "paula", Joined2012)
                            .AddGroupAdmin("paula-altgarde-admin", "altgarde", "paula")
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails("chronik", "Chronik", "", Left2019)
                            .AddRoleHolding("paula-chronik", "chronik", "paula")
                    )
                    .Club(club =>
                        club.AddBoardOffice("archivar", "Archivar", archivedOn: Left2019)
                            .AddBoardSeat("paula-archivar", "archivar", "paula", Joined2012)
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RestoreHer_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Vogt")
                        .AddArchive("paula", Archived2020, "anna")
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepWhenAndByWhomSheWasArchived_When_SheIsArchivedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Vogt")
                        .AddArchive("paula", Archived2020, "anna")
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(Archived2020, ctx.Identity.People.IdOf("anna"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveHerAsSheIs_When_SheIsRestoredWithoutBeingArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-running", "paula", Joined2012)
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, UnknownPersonId, true);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
