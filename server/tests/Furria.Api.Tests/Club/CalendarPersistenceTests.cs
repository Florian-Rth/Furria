using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class CalendarPersistenceTests
{
    private static readonly DateTimeOffset AtTheBall = new(2026, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset BeforeTheBall = new(
        2026,
        11,
        11,
        9,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public CalendarPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepVenueGroupAndVisibility_When_AnEntryIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Club(club =>
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddCalendarEntry(
                                "garde-training",
                                "Training der Tanzgarde",
                                AtTheBall,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                venueAlias: "buehnenhaus",
                                ownerGroupAlias: "tanzgarde",
                                asksForResponse: true
                            )
                    ),
            ct
        );

        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveTitle("Training der Tanzgarde")
            .CalendarEntry(entryId)
            .ToHaveKind(CalendarEntryKind.Training)
            .CalendarEntry(entryId)
            .ToHaveVisibility(CalendarEntryVisibility.Group)
            .CalendarEntry(entryId)
            .ToBeHeldAt(ctx.Club.Venues.IdOf("buehnenhaus"))
            .CalendarEntry(entryId)
            .ToBeOwnedBy(ctx.Groups.Groups.IdOf("tanzgarde"))
            .CalendarEntry(entryId)
            .ToAskForResponse(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheEntry_When_GroupVisibilityNamesNoGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddCalendarEntry(
                            "ownerless",
                            "Geheime Sitzung",
                            AtTheBall,
                            visibility: CalendarEntryVisibility.Group
                        )
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_calendar_entry_owner_visibility", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RefuseTheEntry_When_ItEndsBeforeItBegins()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddCalendarEntry("backwards", "Sitzung", AtTheBall, BeforeTheBall)
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_calendar_entry_window", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RefuseTheSecondAnswer_When_ThePersonHasAlreadyAnswered()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
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
                                .AddAttendanceResponse(
                                    "alice-says-no",
                                    "meeting",
                                    "alice",
                                    AttendanceAnswer.No
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal(
            "ix_attendance_response_calendar_entry_id_person_id",
            violation.ConstraintName
        );
    }
}
