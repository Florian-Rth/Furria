using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Announcements;

[Collection("Api")]
public sealed class WithdrawAnnouncementTests
{
    private const string Title = "Saalreinigung";
    private const string Body = "Am Samstag räumen wir gemeinsam den Saal auf.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset PublishedInFebruary = new(
        2021,
        2,
        5,
        9,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public WithdrawAnnouncementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeTheAnnouncementDown_When_TheAuthorHoldsNoPermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.POSTAsync<WithdrawAnnouncement, WithdrawAnnouncementRequest>(
            new() { AnnouncementId = announcementId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToNotExist()
            .Announcement(ctx.Club.Announcements.IdOf("von-bea"))
            .ToHaveTitle(Title)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TakeAForeignAnnouncementDown_When_TheCallerHoldsThePermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.POSTAsync<WithdrawAnnouncement, WithdrawAnnouncementRequest>(
            new() { AnnouncementId = announcementId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNeitherAutorNorBerechtigt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.POSTAsync<WithdrawAnnouncement, WithdrawAnnouncementRequest>(
            new() { AnnouncementId = announcementId }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToHaveTitle(Title).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheAnnouncementIsAlreadyOffTheBoard()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var announcementId = ctx.Club.Announcements.IdOf("von-alice");
        var taken = await client.POSTAsync<WithdrawAnnouncement, WithdrawAnnouncementRequest>(
            new() { AnnouncementId = announcementId }
        );

        var response = await client.POSTAsync<WithdrawAnnouncement, WithdrawAnnouncementRequest>(
            new() { AnnouncementId = announcementId }
        );

        Assert.Equal(HttpStatusCode.NoContent, taken.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);

        var response = await _fixture
            .CreateClient()
            .POSTAsync<WithdrawAnnouncement, WithdrawAnnouncementRequest>(
                new() { AnnouncementId = ctx.Club.Announcements.IdOf("von-alice") }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Task<SeededContext> BuildBoardAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("bea", "Bea", "Aushang")
                            .AddAccount("bea")
                            .AddMembership("bea-first", "bea", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Leser")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aushangwart",
                            "bea-aushangwart",
                            "Aushangwart",
                            "bea",
                            FurriaPermissions.AnnouncementsPost
                        )
                    )
                    .Club(club =>
                        club.AddAnnouncement("von-alice", "alice", Title, Body, PublishedInFebruary)
                            .AddAnnouncement("von-bea", "bea", Title, Body, PublishedInFebruary)
                    ),
            ct
        );
}
