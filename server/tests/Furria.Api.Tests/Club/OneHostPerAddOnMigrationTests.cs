using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class OneHostPerAddOnMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeOneHost = "20261112100609_AnnouncementMentions";

    private static readonly DateTimeOffset AtTheBall = new(2026, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public OneHostPerAddOnMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepPollsListsAndAnswers_When_TheAddOnTablesBecomeHostNeutral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(WithAnsweredAddOns, ct);
        var aliceId = ctx.Identity.People.IdOf("alice");
        await _fixture.MigrateDatabaseToAsync(BeforeOneHost, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        await ctx
            .Expected.Poll(ctx.Club.Polls.IdOf("date-poll"))
            .ToHaveVotesOf(aliceId, "Samstag")
            .SignUpList(ctx.Club.SignUpLists.IdOf("cakes"))
            .ToHaveLines((aliceId, "Apfelkuchen"))
            .AttendanceResponsesFor(ctx.Club.CalendarEntries.IdOf("meeting"))
            .ToCarryAnswerFrom(aliceId, AttendanceAnswer.Yes)
            .AssertAsync(ct);
    }

    private static void WithAnsweredAddOns(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddPerson("alice", "Alice", "Muster"))
            .Club(club =>
                club.AddCalendarEntry("meeting", "Vereinssitzung", AtTheBall, asksForResponse: true)
                    .AddAttendanceResponse(
                        "alice-says-yes",
                        "meeting",
                        "alice",
                        AttendanceAnswer.Yes
                    )
                    .AddCalendarPoll("date-poll", "meeting", "Wann?", ["Freitag", "Samstag"])
                    .AddCalendarPollVote("date-poll", "Samstag", "alice")
                    .AddCalendarSignUpList("cakes", "meeting", "Kuchen")
                    .AddCalendarSignUpLine("alice-bakes", "cakes", "alice", "Apfelkuchen")
            );
}
