using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Announcements;

[Collection("Api")]
public sealed class PostAnnouncementTests
{
    private const string Title = "Saalreinigung";
    private const string Body = "Am Samstag räumen wir gemeinsam den Saal auf.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ValidUntilInMarch = new(2027, 3, 1);

    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PostAnnouncementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_HangTheAnnouncementUp_When_ThePermittedPersonWritesIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildBoardAsync(ct);
                var client = await ctx.Identity.ClientForAsync("bea", ct);

                var (response, result) = await client.POSTAsync<
                    PostAnnouncement,
                    PostAnnouncementRequest,
                    PostAnnouncementResponse
                >(
                    new()
                    {
                        Title = Title,
                        Body = Body,
                        ValidUntil = ValidUntilInMarch,
                    }
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await ctx
                    .Expected.Announcement(result.AnnouncementId)
                    .ToHaveTitle(Title)
                    .Announcement(result.AnnouncementId)
                    .ToHaveBody(Body)
                    .Announcement(result.AnnouncementId)
                    .ToHaveValidUntil(ValidUntilInMarch)
                    .Announcement(result.AnnouncementId)
                    .ToHaveAuthor(ctx.Identity.People.IdOf("bea"))
                    .Announcement(result.AnnouncementId)
                    .ToHavePublishedAt(InsideTheSession)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_HangAnOpenEndedAnnouncementUp_When_NoValidUntilIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (response, result) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = Body,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Announcement(result.AnnouncementId)
            .ToHaveValidUntil(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTitelIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (response, _) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = "",
                Body = Body,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTextIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (response, _) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = "",
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheMemberHoldsNoPermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, _) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = Body,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<PostAnnouncement, PostAnnouncementRequest, PostAnnouncementResponse>(
                new()
                {
                    Title = Title,
                    Body = Body,
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
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aushangwart",
                            "bea-aushangwart",
                            "Aushangwart",
                            "bea",
                            FurriaPermissions.AnnouncementsPost
                        )
                    ),
            ct
        );
}
