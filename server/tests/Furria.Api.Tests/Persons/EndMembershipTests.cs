using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class EndMembershipTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int PausedFrom2024 = 2024;
    private const int LastSessionOf2026March = 2025;
    private const int PausedFrom2018 = 2018;
    private const int PausedUntil2019 = 2019;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly LeftIn2026 = new(2026, 3, 1);

    private readonly ApiTestFixture _fixture;

    public EndMembershipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheMembership_When_AManagerEndsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                EndedOn = LeftIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2026)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveOpenCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheMembershipIsAlreadyEnded()
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
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                EndedOn = LeftIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Mitgliedschaft ist bereits beendet."], failures[ConflictField]);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheEndPredatesTheStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                EndedOn = JoinedIn2017.AddDays(-1),
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
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClampTheOpenMembershipPause_When_TheMembershipEnds()
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
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
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
    public async Task Should_ReturnUnprocessableEntity_When_AClosedMembershipPauseWouldFallOutside()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddMembershipPause(
                            "paula-ruht",
                            "paula-erste",
                            PausedFrom2024,
                            LastSessionOf2026March
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                EndedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Die Ruhezeit 2024/25 – 2025/26 liegt dann außerhalb der Mitgliedschaft."],
            failures[ValidationField]
        );
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToBeOpen()
            .MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruht"))
            .ToHaveSpan(PausedFrom2024, LastSessionOf2026March)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheClosedMembershipPause_When_TheMembershipEnds()
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
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                EndedOn = LeftIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheMembershipBelongsToAnotherPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("mara", "Mara", "Lenz")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("mara"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                EndedOn = LeftIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToBeOpen()
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
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = 0,
                EndedOn = LeftIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToBeOpen()
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
        var response = await client.POSTAsync<EndMembership, EndMembershipRequest>(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                EndedOn = LeftIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToBeOpen()
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
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .POSTAsync<EndMembership, EndMembershipRequest>(
                new()
                {
                    PersonId = ctx.Identity.People.IdOf("paula"),
                    MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                    EndedOn = LeftIn2026,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("paula-erste"))
            .ToBeOpen()
            .AssertAsync(ct);
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
