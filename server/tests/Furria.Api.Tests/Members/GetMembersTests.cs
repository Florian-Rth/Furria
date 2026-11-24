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

public sealed class GetMembersTests : IClassFixture<ApiTestFixture>
{
    private const string MembersRoute = "/api/members";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetMembersTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ContainHer_When_APersonOnlyBelongsToAGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("paula")
        );
        Assert.Equal(MembershipState.None, paula.MembershipState);
        var tanzgarde = Assert.Single(paula.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
    }

    [Fact]
    public async Task Should_ContainNeitherOfThem_When_APersonLeftTheClubOrOnlyBuysTickets()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("frank", "Frank", "Ehemalig")
                        .AddMembership("frank-first", "frank", JoinedIn2017, LeftIn2020)
                        .AddPerson("tom", "Tom", "Kartenkäufer")
                        .AddAccount("tom")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("frank")
        );
        Assert.DoesNotContain(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("tom")
        );
    }

    [Fact]
    public async Task Should_OmitTheGroup_When_TheGroupMembershipEndedOrTheGroupIsArchived()
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
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2021
                            )
                            .AddGroup("marschmusik", "Marschmusik")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership("paula-showtanz", "showtanz", "paula", JoinedIn2017)
                            .AddGroupMembership(
                                "paula-marschmusik",
                                "marschmusik",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("paula")
        );
        var marschmusik = Assert.Single(paula.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("marschmusik"), marschmusik.GroupId);
    }

    [Fact]
    public async Task Should_CarryNoContactData_When_TheListIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddPersonContact(
                            "alice",
                            "alice@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra",
                            contactVisibleToMembers: true,
                            new DateOnly(1996, 4, 3)
                        )
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var payload = await client.GetStringAsync(MembersRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var member = document.RootElement.GetProperty("members").EnumerateArray().First();
        var fields = member.EnumerateObject().Select(field => field.Name).ToArray();
        Assert.Equal(
            [
                "personId",
                "firstName",
                "lastName",
                "portrait",
                "membershipState",
                "groups",
                "honours",
            ],
            fields
        );
    }

    [Fact]
    public async Task Should_CountUnpausedSessions_When_HerMembershipHadAPause()
    {
        var ct = TestContext.Current.CancellationToken;
        var relevantYear = ClubSession.RelevantYearOf(_fixture.Today);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddAccount("alice")
                        .AddMembership(
                            "alice-first",
                            "alice",
                            ClubSession.OpeningOf(relevantYear - 4)
                        )
                        .AddMembershipPause(
                            "alice-pause",
                            "alice-first",
                            relevantYear - 2,
                            relevantYear - 2
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (_, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        var alice = Assert.Single(result.Members);
        Assert.Equal(4, alice.Honours.Sessions);
    }
}
