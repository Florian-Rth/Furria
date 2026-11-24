using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Members;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Members;

public sealed class GetMemberByIdTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetMemberByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetMemberByIdResponse>> ReadCardAsync(
        HttpClient client,
        int personId
    ) =>
        client.GETAsync<GetMemberById, GetMemberByIdRequest, GetMemberByIdResponse>(
            new GetMemberByIdRequest { PersonId = personId }
        );

    [Fact]
    public async Task Should_WithholdEveryField_When_TheTargetDidNotOptInAndTheViewerHoldsNoKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact(
                            "paula",
                            "paula@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra"
                        )
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ContactVisibility.Hidden, result.Contact.Visibility);
        Assert.Null(result.Contact.Phone);
        Assert.Null(result.Contact.Email);
        Assert.Null(result.Contact.Street);
        Assert.Null(result.Contact.Zip);
        Assert.Null(result.Contact.City);
    }

    [Fact]
    public async Task Should_RevealTheContactData_When_TheViewerHoldsPersonsReadDetails()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPersonContact(
                                "paula",
                                "paula@example.test",
                                "0170 1234567",
                                "Hauptstraße 12",
                                "99713",
                                "Großfurra"
                            )
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                            .AddPerson("katrin", "Katrin", "Kühnel")
                            .AddAccount("katrin")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "mitgliederpflege",
                            "katrin-mitgliederpflege",
                            "Mitgliederpflege",
                            "katrin",
                            FurriaPermissions.PersonsReadDetails
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));
        var payload = await client.GetStringAsync(
            $"/api/members/{ctx.Identity.People.IdOf("paula")}",
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ContactVisibility.RevealedByPermission, result.Contact.Visibility);
        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            "revealedByPermission",
            document.RootElement.GetProperty("contact").GetProperty("visibility").GetString()
        );
        Assert.Equal("0170 1234567", result.Contact.Phone);
        Assert.Equal("paula@example.test", result.Contact.Email);
        Assert.Equal("Hauptstraße 12", result.Contact.Street);
        Assert.Equal("99713", result.Contact.Zip);
        Assert.Equal("Großfurra", result.Contact.City);
    }

    [Fact]
    public async Task Should_ReportTheChainMinimum_When_SheLeftAndRejoinedTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde-first",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde-again",
                                "tanzgarde",
                                "paula",
                                RejoinedIn2023
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(JoinedIn2017, tanzgarde.Since);
    }

    [Fact]
    public async Task Should_KeepTheFirstStartDate_When_SheQuitAndRejoinedTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddAccount("paula")
                        .AddMembership("paula-first", "paula", JoinedIn2017, LeftIn2020)
                        .AddMembership("paula-again", "paula", RejoinedIn2023)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Active, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
    }

    [Fact]
    public async Task Should_ReportPaused_When_TheRunningMembershipPausesThisSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddAccount("paula")
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                        .AddMembershipPause(
                            "paula-ruhezeit",
                            "paula-first",
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Paused, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsNoLongerAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("frank", "Frank", "Ehemalig")
                            .AddMembership("frank-first", "frank", JoinedIn2017, LeftIn2020)
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2021
                            )
                            .AddGroupMembership("frank-showtanz", "showtanz", "frank", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, _) = await ReadCardAsync(client, ctx.Identity.People.IdOf("frank"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_WithholdHerOwnContactData_When_SheReadsHerOwnCardWithoutOptingIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", "paula@example.test", "0170 1234567")
                        .AddAccount("paula")
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ContactVisibility.Hidden, result.Contact.Visibility);
        Assert.Null(result.Contact.Phone);
        Assert.Null(result.Contact.Email);
    }
}
