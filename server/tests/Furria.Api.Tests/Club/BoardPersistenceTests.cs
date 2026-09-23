using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class BoardPersistenceTests
{
    private static readonly DateOnly SeatedIn2023 = new(2023, 3, 1);
    private static readonly DateOnly HandedOverIn2025 = new(2025, 3, 1);

    private readonly ApiTestFixture _fixture;

    public BoardPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepOfficeAndPeriod_When_ABoardSeatIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("nadine", "Nadine", "Wolters"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat(
                                "nadine-praesident",
                                "praesident",
                                "nadine",
                                SeatedIn2023,
                                HandedOverIn2025
                            )
                    ),
            ct
        );

        await ctx
            .Expected.BoardSeat(ctx.Club.BoardSeats.IdOf("nadine-praesident"))
            .ToBeHeldBy(ctx.Identity.People.IdOf("nadine"))
            .BoardSeat(ctx.Club.BoardSeats.IdOf("nadine-praesident"))
            .ToFillOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .BoardSeat(ctx.Club.BoardSeats.IdOf("nadine-praesident"))
            .ToRunFrom(SeatedIn2023, HandedOverIn2025)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheSecondRecord_When_TheBoardOfficeIsAlreadyNoted()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddBoardOffice("from-the-statutes", "Präsident")
                            .AddBoardOffice("from-the-minutes", "Präsident", sortOrder: 2)
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_board_office_name", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectTheSeat_When_TheBoardSeatEndsBeforeItStarts()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder
                        .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                        .Club(club =>
                            club.AddBoardOffice("finanzen", "Finanzen", sortOrder: 5)
                                .AddBoardSeat(
                                    "ilka-finanzen",
                                    "finanzen",
                                    "ilka",
                                    HandedOverIn2025,
                                    SeatedIn2023
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_board_seat_period", violation.ConstraintName);
    }
}
