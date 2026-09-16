using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class PutMembershipPauseTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int PausedFrom2018 = 2018;
    private const int PausedUntil2019 = 2019;
    private const int BeforeTheMitgliedschaft = 2015;
    private const int PausedFrom2022 = 2022;
    private const int PausedUntil2023 = 2023;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2022 = new(2022, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutMembershipPauseTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CorrectTheSpan_When_AManagerFixesARuhezeit()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithClosedRuhezeitAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = PausedFrom2018,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedFrom2018)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheSpanLeavesTheMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithClosedRuhezeitAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                FirstSessionYear = BeforeTheMitgliedschaft,
                LastSessionYear = BeforeTheMitgliedschaft + 1,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Die Ruhezeit 2015/16 – 2016/17 liegt außerhalb der Mitgliedschaft."],
            failures[ValidationField]
        );
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheCorrectedSpanOverlapsAnotherRuhezeit()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddMembershipPause(
                            "paula-ruhte",
                            "paula-erste",
                            PausedFrom2018,
                            PausedUntil2019
                        )
                        .AddMembershipPause(
                            "paula-ruhte-wieder",
                            "paula-erste",
                            PausedFrom2022,
                            PausedUntil2023
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = PausedFrom2022,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Dieser Zeitraum überschneidet sich mit einer bestehenden Ruhezeit."],
            failures[ConflictField]
        );
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CloseTheOpenRuhezeit_When_TheLastSessionIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddMembershipPause("paula-ruht", "paula-erste", PausedFrom2018)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruht"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = PausedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruht"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheLastSessionPrecedesTheFirst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithClosedRuhezeitAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                FirstSessionYear = PausedUntil2019,
                LastSessionYear = PausedFrom2018,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Ruhezeit kann nicht vor ihrer ersten Session enden."],
            failures[ValidationField]
        );
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheRuhezeitStaysOpenOnAnEndedMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddMembershipPause(
                            "paula-ruhte",
                            "paula-erste",
                            PausedFrom2018,
                            PausedUntil2019
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Zu einer beendeten Mitgliedschaft gehört keine offene Ruhezeit. "
                    + "Gib die letzte Session an.",
            ],
            failures[ValidationField]
        );
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRuhezeitBelongsToAnotherMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddMembership("paula-zweite", "paula", RejoinedIn2022)
                        .AddMembershipPause(
                            "paula-ruhte",
                            "paula-erste",
                            PausedFrom2018,
                            PausedUntil2019
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-zweite"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                FirstSessionYear = PausedFrom2022,
                LastSessionYear = PausedUntil2023,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithClosedRuhezeitAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = 0,
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = PausedFrom2018,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                            .AddMembership("paula-erste", "paula", JoinedIn2017)
                            .AddMembershipPause(
                                "paula-ruhte",
                                "paula-erste",
                                PausedFrom2018,
                                PausedUntil2019
                            )
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = PausedFrom2018,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithClosedRuhezeitAsync(ct);

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
                new()
                {
                    PersonId = ctx.Identity.People.IdOf("paula"),
                    MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                    PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte"),
                    FirstSessionYear = PausedFrom2018,
                    LastSessionYear = PausedFrom2018,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ChangeOnlyTheAddressedRuhezeit_When_TheMitgliedschaftHasSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddMembershipPause(
                            "paula-ruhte",
                            "paula-erste",
                            PausedFrom2018,
                            PausedUntil2019
                        )
                        .AddMembershipPause(
                            "paula-ruhte-wieder",
                            "paula-erste",
                            PausedFrom2022,
                            PausedUntil2023
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembershipPause, PutMembershipPauseRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                PauseId = ctx.Identity.Pauses.IdOf("paula-ruhte-wieder"),
                FirstSessionYear = PausedFrom2022,
                LastSessionYear = PausedFrom2022,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte-wieder"))
            .ToHaveSpan(PausedFrom2022, PausedFrom2022)
            .MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithClosedRuhezeitAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddMembershipPause(
                            "paula-ruhte",
                            "paula-erste",
                            PausedFrom2018,
                            PausedUntil2019
                        )
                ),
            ct
        );

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
