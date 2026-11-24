using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class CalendarPersistenceTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset AtTheBall = new(2026, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public CalendarPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseAnEvent_When_ItsAudienceIsNotTheClub()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddCalendarEntry(
                            "gala",
                            "Prunksitzung",
                            AtTheBall,
                            kind: CalendarEntryKind.Event,
                            audience: CalendarEntryAudience.People
                        )
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_calendar_entry_event_club", violation.ConstraintName);
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
