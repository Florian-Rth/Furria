using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class AddOnHostPersistenceTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset AtTheBall = new(2026, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public AddOnHostPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData(AddOnTable.Poll, "ck_poll_one_host")]
    [InlineData(AddOnTable.SignUpList, "ck_sign_up_list_one_host")]
    [InlineData(AddOnTable.AttendanceResponse, "ck_attendance_response_one_host")]
    public async Task Should_RefuseTheAddOn_When_ItLosesItsHost(AddOnTable table, string constraint)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeedHostsAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");

        var violation = await Assert.ThrowsAsync<PostgresException>(() =>
            _fixture.RehostAddOnsDirectlyAsync(table, entryId, new AddOnHostColumns(null, null), ct)
        );

        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal(constraint, violation.ConstraintName);
    }

    [Theory]
    [InlineData(AddOnTable.Poll, "ck_poll_one_host")]
    [InlineData(AddOnTable.SignUpList, "ck_sign_up_list_one_host")]
    [InlineData(AddOnTable.AttendanceResponse, "ck_attendance_response_one_host")]
    public async Task Should_RefuseTheAddOn_When_BothAnEntryAndAnAnnouncementHostIt(
        AddOnTable table,
        string constraint
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeedHostsAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");
        var announcementId = ctx.Club.Announcements.IdOf("helpers-wanted");

        var violation = await Assert.ThrowsAsync<PostgresException>(() =>
            _fixture.RehostAddOnsDirectlyAsync(
                table,
                entryId,
                new AddOnHostColumns(entryId, announcementId),
                ct
            )
        );

        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal(constraint, violation.ConstraintName);
    }

    [Fact]
    public async Task Should_DeleteItsPollsAndSignUpLists_When_AnAnnouncementIsDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeedHostsAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("meeting");
        var announcementId = ctx.Club.Announcements.IdOf("helpers-wanted");
        var announcementHost = new AddOnHostColumns(null, announcementId);

        await _fixture.RehostAddOnsDirectlyAsync(AddOnTable.Poll, entryId, announcementHost, ct);
        await _fixture.RehostAddOnsDirectlyAsync(
            AddOnTable.SignUpList,
            entryId,
            announcementHost,
            ct
        );
        await _fixture.DeleteAnnouncementDirectlyAsync(announcementId, ct);

        await ctx
            .Expected.Poll(ctx.Club.Polls.IdOf("date-poll"))
            .ToNotExist()
            .SignUpList(ctx.Club.SignUpLists.IdOf("cakes"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    private Task<SeededContext> SeedHostsAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("alice", "Alice", "Muster"))
                    .Club(club =>
                        club.AddCalendarEntry(
                                "meeting",
                                "Vereinssitzung",
                                AtTheBall,
                                asksForResponse: true
                            )
                            .AddAttendanceResponse(
                                "alice-says-yes",
                                "meeting",
                                "alice",
                                AttendanceAnswer.Yes
                            )
                            .AddCalendarPoll(
                                "date-poll",
                                "meeting",
                                "Wann?",
                                ["Freitag", "Samstag"]
                            )
                            .AddCalendarSignUpList("cakes", "meeting", "Kuchen")
                            .AddAnnouncement(
                                "helpers-wanted",
                                "alice",
                                "Helfer gesucht",
                                "Bitte melden."
                            )
                    ),
            ct
        );
}
