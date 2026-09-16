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
public sealed class PutMembershipTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int PausedFrom2018 = 2018;
    private const int PausedUntil2019 = 2019;
    private const int PausedFrom2024 = 2024;
    private const int LastSessionOf2026March = 2025;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly CorrectedStart = new(2017, 11, 11);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2022 = new(2022, 1, 1);
    private static readonly DateOnly LeftIn2023 = new(2023, 1, 1);
    private static readonly DateOnly LeftIn2026 = new(2026, 3, 1);

    private readonly ApiTestFixture _fixture;

    public PutMembershipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CorrectThePeriod_When_AManagerFixesTheStartDate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = CorrectedStart,
                EndedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(CorrectedStart, LeftIn2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheCorrectedPeriodOverlapsAnother()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithTwoClosedPeriodsAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = JoinedIn2017,
                EndedOn = RejoinedIn2022,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Dieser Zeitraum überschneidet sich mit einer bestehenden Mitgliedschaft. "
                    + "Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Mitgliedschaft.",
            ],
            failures[ConflictField]
        );
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ClearingTheEndWouldRunASecondMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddMembership("paula-zweite", "paula", RejoinedIn2022)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = JoinedIn2017,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Es läuft bereits eine Mitgliedschaft."], failures[ConflictField]);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_ThePeriodEndsBeforeItStarts()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithTwoClosedPeriodsAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = new DateOnly(2022, 6, 1),
                EndedOn = new DateOnly(2022, 2, 1),
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Mitgliedschaft kann nicht vor ihrem Beginn enden."],
            failures[ValidationField]
        );
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_AClosedRuhezeitWouldFallOutside()
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
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = RejoinedIn2022,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Die Ruhezeit 2018/19 – 2019/20 liegt dann außerhalb der Mitgliedschaft."],
            failures[ValidationField]
        );
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClampTheOpenRuhezeit_When_ThePeriodGainsAnEnd()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddMembershipPause("paula-ruht", "paula-erste", PausedFrom2024)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = JoinedIn2017,
                EndedOn = LeftIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2026)
            .MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruht"))
            .ToHaveSpan(PausedFrom2024, LastSessionOf2026March)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReopenTheMitgliedschaft_When_TheEndIsCleared()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = JoinedIn2017,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToBeOpen()
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheMitgliedschaftBelongsToAnotherPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("mara", "Mara", "Lenz")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("mara"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = CorrectedStart,
                EndedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = 0,
                StartedOn = CorrectedStart,
                EndedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
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
                            .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
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
        var response = await client.PUTAsync<PutMembership, PutMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                StartedOn = CorrectedStart,
                EndedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                ),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutMembership, PutMembershipRequest>(
                new()
                {
                    PersonId = ctx.Identity.People.IdOf("paula"),
                    MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                    StartedOn = CorrectedStart,
                    EndedOn = LeftIn2020,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithTwoClosedPeriodsAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddMembership("paula-zweite", "paula", RejoinedIn2022, LeftIn2023)
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
