using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Announcements;

[Collection("Api")]
public sealed class PutAnnouncementTests
{
    private const string Title = "Saalreinigung";
    private const string Body = "Am Samstag räumen wir gemeinsam den Saal auf.";
    private const string CorrectedTitle = "Saalreinigung fällt aus";
    private const string CorrectedBody = "Der Termin verschiebt sich auf die kommende Woche.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ValidUntilInMarch = new(2021, 3, 1);

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

    public PutAnnouncementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CorrectTheAushang_When_TheAutorHoldsNoBerechtigung()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToHaveTitle(CorrectedTitle)
            .Announcement(announcementId)
            .ToHaveBody(CorrectedBody)
            .Announcement(announcementId)
            .ToHaveValidUntil(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheDatum_When_AnAushangIsCorrected()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = ValidUntilInMarch,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToHavePublishedAt(PublishedInFebruary)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CorrectAForeignAushang_When_TheCallerHoldsTheBerechtigung()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToHaveTitle(CorrectedTitle).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNeitherAutorNorBerechtigt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToHaveTitle(Title).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheAushangIsAlreadyOffTheBoard()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = ctx.Club.Announcements.IdOf("von-alice") + 1,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTitelIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = ctx.Club.Announcements.IdOf("von-alice"),
                Title = "",
                Body = CorrectedBody,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
                new()
                {
                    AnnouncementId = ctx.Club.Announcements.IdOf("von-alice"),
                    Title = CorrectedTitle,
                    Body = CorrectedBody,
                    ValidUntil = null,
                }
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
                        club.AddAnnouncement(
                            "von-alice",
                            "alice",
                            Title,
                            Body,
                            PublishedInFebruary,
                            ValidUntilInMarch
                        )
                    ),
            ct
        );
}
