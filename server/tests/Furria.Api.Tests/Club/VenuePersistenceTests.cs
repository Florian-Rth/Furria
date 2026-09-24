using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class VenuePersistenceTests
{
    private static readonly DateOnly ArchivedOn = new(2024, 2, 14);

    private readonly ApiTestFixture _fixture;

    public VenuePersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepNameAndOrder_When_AVenueIsRecorded()
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
    public async Task Should_KeepTheAddressAndTheHint_When_AVenueIsWrittenDown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue(
                        "buehnenhaus",
                        "Bühnenhaus",
                        street: "Bahnhofstraße 12",
                        zip: "47533",
                        city: "Kleve",
                        hint: "Eingang über den Hof"
                    )
                ),
            ct
        );

        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .ToHaveAddress("Bahnhofstraße 12", "47533", "Kleve")
            .Venue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .ToHaveHint("Eingang über den Hof")
            .Venue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheVenue_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("alte-turnhalle", "Alte Turnhalle", archivedOn: ArchivedOn)
                ),
            ct
        );

        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("alte-turnhalle"))
            .ToBeArchivedOn(ArchivedOn)
            .Venue(ctx.Club.Venues.IdOf("alte-turnhalle"))
            .ToHaveName("Alte Turnhalle")
            .AssertAsync(ct);
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
