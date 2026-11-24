using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class VenuePersistenceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public VenuePersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RejectTheSecondRecord_When_TheVenueIsAlreadyWrittenDown()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddVenue("from-the-minutes", "Bühnenhaus")
                            .AddVenue("vom-schluesselbrett", "Bühnenhaus", 2)
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_venue_name", violation.ConstraintName);
    }
}
