using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Push.SubscribedDevices;

namespace Furria.Api.Tests.Announcements;

public sealed class AnnouncementPushesTests : IClassFixture<ApiTestFixture>
{
    private const string Title = "Saalreinigung";
    private const string Body = "Am Samstag räumen wir gemeinsam den Saal auf.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private readonly ApiTestFixture _fixture;

    public AnnouncementPushesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PushEveryMemberButTheAuthor_When_AnAnnouncementIsPosted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);

        var announcementId = await PostAsync(ctx, ct);

        await _fixture.PushesDrainedAsync(ct);
        var pushes = PushesAt(_fixture, devices.Alice);
        Assert.Equal([$"/announcements/{announcementId}"], [.. pushes.Select(UrlOf)]);
        Assert.Equal(["Neuer Aushang"], [.. pushes.Select(TitleOf)]);
        Assert.Equal([Title], [.. pushes.Select(BodyOf)]);
        Assert.Single(PushesAt(_fixture, devices.Paula));
        Assert.Empty(PushesAt(_fixture, devices.Bea));
        Assert.Empty(PushesAt(_fixture, devices.Fred));
    }

    [Fact]
    public async Task Should_PushNobody_When_ThePostedAnnouncementHasAlreadyExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var devices = await DevicesAsync(ctx, ct);
        var twoDaysAgo = DateOnly
            .FromDateTime(_fixture.TimeProvider.GetUtcNow().UtcDateTime)
            .AddDays(-2);

        await PostAsync(ctx, twoDaysAgo, ct);

        await _fixture.PushesDrainedAsync(ct);
        Assert.Empty(PushesAt(_fixture, devices.Alice));
    }

    [Fact]
    public async Task Should_PushNobody_When_AnAnnouncementIsEdited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var announcementId = await PostAsync(ctx, ct);
        await _fixture.PushesDrainedAsync(ct);
        var devices = await DevicesAsync(ctx, ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = "Saalreinigung verschoben",
                Body = Body,
                ValidUntil = null,
                AddOns = [],
            }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        await _fixture.PushesDrainedAsync(ct);
        Assert.Empty(PushesAt(_fixture, devices.Alice));
    }

    private static Task<int> PostAsync(SeededContext ctx, CancellationToken ct) =>
        PostAsync(ctx, null, ct);

    private static async Task<int> PostAsync(
        SeededContext ctx,
        DateOnly? validUntil,
        CancellationToken ct
    )
    {
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
                ValidUntil = validUntil,
                AddOns = [],
            }
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.AnnouncementId;
    }

    private static async Task<ClubDevices> DevicesAsync(SeededContext ctx, CancellationToken ct)
    {
        var run = Guid.NewGuid().ToString("N");

        return new(
            await SubscribedDeviceAsync(ctx, "alice", $"alice-{run}", ct),
            await SubscribedDeviceAsync(ctx, "bea", $"bea-{run}", ct),
            await SubscribedDeviceAsync(ctx, "paula", $"paula-{run}", ct),
            await SubscribedDeviceAsync(ctx, "fred", $"fred-{run}", ct)
        );
    }

    private static string TitleOf(JsonElement push) => push.GetProperty("title").GetString() ?? "";

    private static string BodyOf(JsonElement push) => push.GetProperty("body").GetString() ?? "";

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
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
                            .AddPerson("paula", "Paula", "Pause")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                            .AddMembershipPause("paula-pause", "paula-first", 2026, 2026)
                            .AddPerson("fred", "Fred", "Fremd")
                            .AddAccount("fred")
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

    private sealed record ClubDevices(string Alice, string Bea, string Paula, string Fred);
}
