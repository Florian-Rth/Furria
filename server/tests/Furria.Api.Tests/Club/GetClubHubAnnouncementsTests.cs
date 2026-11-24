using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class GetClubHubAnnouncementsTests : IClassFixture<ApiTestFixture>
{
    private const string Body = "Der Saal bleibt am Freitag geschlossen.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ExpiredBeforeTheSession = new(2026, 12, 31);
    private static readonly DateOnly ValidIntoTheSession = new(2027, 3, 1);

    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInOctober = new(
        2026,
        10,
        12,
        10,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInNovember = new(
        2026,
        11,
        11,
        11,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInDecember = new(
        2026,
        12,
        1,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInJanuary = new(
        2027,
        1,
        2,
        9,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetClubHubAnnouncementsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheNewestThreeAndCountThemAll_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildBoardAsync(ct);
                var result = await ReadAsync(ctx, ct);

                Assert.Equal(
                    [
                        ctx.Club.Announcements.IdOf("januar"),
                        ctx.Club.Announcements.IdOf("dezember"),
                        ctx.Club.Announcements.IdOf("november"),
                    ],
                    result.Announcements.Newest.Select(announcement => announcement.AnnouncementId)
                );
                Assert.Equal(4, result.Announcements.TotalCount);
            }
        );
    }

    private Task<SeededContext> BuildBoardAsync(CancellationToken ct) =>
        BuildAsync(
            club =>
                club.AddAnnouncement(
                        "abgelaufen",
                        "alice",
                        "Abgelaufen",
                        Body,
                        PublishedInNovember,
                        ExpiredBeforeTheSession
                    )
                    .AddAnnouncement("oktober", "alice", "Oktober", Body, PublishedInOctober)
                    .AddAnnouncement("november", "alice", "November", Body, PublishedInNovember)
                    .AddAnnouncement("dezember", "alice", "Dezember", Body, PublishedInDecember)
                    .AddAnnouncement(
                        "januar",
                        "alice",
                        "Januar",
                        Body,
                        PublishedInJanuary,
                        ValidIntoTheSession
                    ),
            ct
        );

    private Task<SeededContext> BuildAsync(Action<ClubSeedBuilder> club, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Club(club),
            ct
        );

    private static async Task<GetClubHubResponse> ReadAsync(SeededContext ctx, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
