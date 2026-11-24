using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class BoardPersistenceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public BoardPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
}
