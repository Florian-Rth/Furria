using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class VenuePersistenceTests
{
    private readonly ApiTestFixture _fixture;

    public VenuePersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepNameAndOrder_When_AnOrtIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("buehnenhaus", "Bühnenhaus", 4)),
            ct
        );

        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .ToHaveName("Bühnenhaus")
            .Venue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .ToHaveSortOrder(4)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheSecondRecord_When_TheOrtIsAlreadyWrittenDown()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddVenue("aus-dem-protokoll", "Bühnenhaus")
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
