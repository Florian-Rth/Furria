using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class SessionPersistenceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public SessionPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
}
