using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Venues;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Venues;

public sealed class PutVenueTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string Street = "Am Sportplatz 7";
    private const string Zip = "99713";
    private const string City = "Großfurra";
    private const int UnknownVenueId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly TimeOnly Nine = new(9, 0);
    private static readonly TimeOnly Noon = new(12, 0);
    private static readonly TimeOnly Two = new(14, 0);
    private static readonly TimeOnly Six = new(18, 0);

    private readonly ApiTestFixture _fixture;

    public PutVenueTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheNewAddress_When_TheKeyHolderMovesTheVenue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue(
                        "halle",
                        "Turnhalle",
                        street: "Schulstraße 4",
                        zip: "99713",
                        city: "Großfurra",
                        hint: "Zugang über den Hof"
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("halle"),
                Name = "Sporthalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = [],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveName("Sporthalle")
            .Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveAddress(Street, Zip, City)
            .Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveHint(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheOpeningHours_When_TheVenueIsSavedWithThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("baeckerei", "Bäckerei Schmidt")),
            ct
        );

        var response = await SaveOpeningHoursAsync(
            ctx,
            "baeckerei",
            [
                Slot(DayOfWeek.Monday, Nine, Noon),
                Slot(DayOfWeek.Monday, Two, Six),
                Slot(DayOfWeek.Saturday, Nine, Noon),
            ]
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("baeckerei"))
            .ToHaveOpeningHours(
                (DayOfWeek.Monday, Nine, Noon),
                (DayOfWeek.Monday, Two, Six),
                (DayOfWeek.Saturday, Nine, Noon)
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReplaceTheOpeningHoursAsAWhole_When_TheVenueIsSavedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBakeryOpenOnTuesdayAndWednesdayAsync(ct);

        var response = await SaveOpeningHoursAsync(
            ctx,
            "baeckerei",
            [Slot(DayOfWeek.Friday, Two, Six)]
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("baeckerei"))
            .ToHaveOpeningHours((DayOfWeek.Friday, Two, Six))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClearTheOpeningHours_When_TheVenueIsSavedWithoutThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBakeryOpenOnTuesdayAndWednesdayAsync(ct);

        var response = await SaveOpeningHoursAsync(ctx, "baeckerei", []);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("baeckerei"))
            .ToHaveOpeningHours()
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("closes-before-opens")]
    [InlineData("closes-when-opens")]
    [InlineData("overlap-on-one-day")]
    [InlineData("fifteen-slots")]
    public async Task Should_RefuseTheOpeningHours_When_TheyCannotBeKept(string flaw)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBakeryOpenOnTuesdayAndWednesdayAsync(ct);

        var response = await SaveOpeningHoursAsync(ctx, "baeckerei", FlawedHoursOf(flaw));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("baeckerei"))
            .ToHaveOpeningHours((DayOfWeek.Tuesday, Nine, Noon), (DayOfWeek.Wednesday, Nine, Noon))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTouchingSlots_When_OneClosesWhenTheNextOpens()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBakeryOpenOnTuesdayAndWednesdayAsync(ct);

        var response = await SaveOpeningHoursAsync(
            ctx,
            "baeckerei",
            [Slot(DayOfWeek.Monday, Noon, Two), Slot(DayOfWeek.Monday, Nine, Noon)]
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("baeckerei"))
            .ToHaveOpeningHours((DayOfWeek.Monday, Nine, Noon), (DayOfWeek.Monday, Noon, Two))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherVenueCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("halle", "Turnhalle").AddVenue("lager", "Requisitenlager")
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = [],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diesen Ort gibt es schon."], failures[ConflictField]);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("lager"))
            .ToHaveName("Requisitenlager")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepItsName_When_OnlyTheAddressChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("halle"),
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = [],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("halle"))
            .ToHaveAddress(Street, Zip, City)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheVenueIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("altes-lager"),
                Name = "Neues Lager",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = [],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.Venue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToHaveName("Altes Lager")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheVenueIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = UnknownVenueId,
                Name = "Turnhalle",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = [],
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private Task<SeededContext> BuildBakeryOpenOnTuesdayAndWednesdayAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("baeckerei", "Bäckerei Schmidt")
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Tuesday, Nine, Noon)
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Wednesday, Nine, Noon)
                ),
            ct
        );

    private static IReadOnlyList<OpeningSlotDataDto> FlawedHoursOf(string flaw) =>
        flaw switch
        {
            "closes-before-opens" => [Slot(DayOfWeek.Monday, Noon, Nine)],
            "closes-when-opens" => [Slot(DayOfWeek.Monday, Nine, Nine)],
            "overlap-on-one-day" =>
            [
                Slot(DayOfWeek.Monday, Nine, Two),
                Slot(DayOfWeek.Monday, Noon, Six),
            ],
            _ =>
            [
                .. Enum.GetValues<DayOfWeek>()
                    .SelectMany(day => new[] { Slot(day, Nine, Noon), Slot(day, Two, Six) }),
                Slot(DayOfWeek.Sunday, new TimeOnly(19, 0), new TimeOnly(20, 0)),
            ],
        };

    private static OpeningSlotDataDto Slot(DayOfWeek weekday, TimeOnly opens, TimeOnly closes) =>
        new()
        {
            Weekday = weekday,
            Opens = opens,
            Closes = closes,
        };

    private static async Task<HttpResponseMessage> SaveOpeningHoursAsync(
        SeededContext ctx,
        string venueAlias,
        IReadOnlyList<OpeningSlotDataDto> openingHours
    )
    {
        var client = await ctx.Identity.ManagingLoginClientAsync(
            TestContext.Current.CancellationToken
        );
        return await client.PUTAsync<PutVenue, PutVenueRequest>(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf(venueAlias),
                Name = "Bäckerei Schmidt",
                Street = Street,
                Zip = Zip,
                City = City,
                Hint = null,
                OpeningHours = openingHours,
            }
        );
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
