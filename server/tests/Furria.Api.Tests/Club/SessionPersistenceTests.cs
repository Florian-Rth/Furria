using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class SessionPersistenceTests
{
    private readonly ApiTestFixture _fixture;

    public SessionPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepEveryPartTheClubKnows_When_ASessionIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddSession(
                        "jubilaeum",
                        2021,
                        number: 50,
                        motto: "Grossfurra feiert weiter",
                        logoSvg: "<svg viewBox=\"0 0 10 10\"></svg>"
                    )
                ),
            ct
        );

        await ctx
            .Expected.Session(ctx.Club.Sessions.IdOf("jubilaeum"))
            .ToHaveStartYear(2021)
            .Session(ctx.Club.Sessions.IdOf("jubilaeum"))
            .ToHaveNumber(50)
            .Session(ctx.Club.Sessions.IdOf("jubilaeum"))
            .ToHaveMotto("Grossfurra feiert weiter")
            .Session(ctx.Club.Sessions.IdOf("jubilaeum"))
            .ToHaveLogo("<svg viewBox=\"0 0 10 10\"></svg>")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheSecondRecord_When_TheSeasonIsAlreadyWrittenDown()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddSession("aus-der-festschrift", 2021, number: 50)
                            .AddSession("vom-banner", 2021, motto: "Grossfurra feiert weiter")
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_session_start_year", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectTheNummer_When_AnotherSessionAlreadyCarriesIt()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddSession("jubilaeum", 2021, number: 50)
                            .AddSession("danach", 2022, number: 50)
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_session_number", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_KeepBothRecords_When_NeitherSeasonHasAKnownNummer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddSession("vom-banner", 2021, motto: "Grossfurra feiert weiter")
                        .AddSession("aus-dem-protokoll", 2022, motto: "Grossfurra hebt ab")
                ),
            ct
        );

        await ctx
            .Expected.Session(ctx.Club.Sessions.IdOf("vom-banner"))
            .ToHaveNumber(null)
            .Session(ctx.Club.Sessions.IdOf("aus-dem-protokoll"))
            .ToHaveNumber(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheNummer_When_ItDoesNotCount()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder => builder.Club(club => club.AddSession("nullte", 2021, number: 0)),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_session_number", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_StoreTheYearAlone_When_TheClubKnowsNothingElseAboutTheSeason()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("nur-das-jahr", 1984)),
            ct
        );

        await ctx
            .Expected.Session(ctx.Club.Sessions.IdOf("nur-das-jahr"))
            .ToHaveStartYear(1984)
            .Session(ctx.Club.Sessions.IdOf("nur-das-jahr"))
            .ToHaveNumber(null)
            .Session(ctx.Club.Sessions.IdOf("nur-das-jahr"))
            .ToHaveMotto(null)
            .Session(ctx.Club.Sessions.IdOf("nur-das-jahr"))
            .ToHaveLogo(null)
            .AssertAsync(ct);
    }
}
