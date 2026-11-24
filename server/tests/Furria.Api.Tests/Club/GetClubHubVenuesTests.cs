using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class GetClubHubVenuesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);
    private static readonly DateOnly HeldSince2026 = new(2026, 5, 1);
    private static readonly DateOnly EndedYesterday = new(2027, 1, 14);
    private static readonly DateOnly EndsNextSummer = new(2027, 6, 30);

    private readonly ApiTestFixture _fixture;

    public GetClubHubVenuesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveOutAVenue_When_NobodyHoldsAKeyToItToday()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await ArrangeAsync(
                    identity => identity.AddPerson("bea", "Bea", "Kessler"),
                    club =>
                        club.AddVenue("schuppen", "Gerätschuppen", 1)
                            .AddVenue("werkstatt", "Fahrzeugwerkstatt", 2)
                            .AddVenue("garage", "Wagengarage", 3)
                            .AddKeyHolding("bea-werkstatt", "werkstatt", "bea", HeldSince2024)
                            .AddKeyHolding(
                                "bea-garage",
                                "garage",
                                "bea",
                                HeldSince2024,
                                EndedYesterday
                            ),
                    ct
                );

                var result = await ReadAsync(ctx, ct);

                Assert.Equal(["Fahrzeugwerkstatt"], result.Venues.Select(venue => venue.Name));
            }
        );
    }

    [Fact]
    public async Task Should_NameTheHolderOnceWithHerEarlierBeginn_When_TwoRunningHoldingsOverlap()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await ArrangeAsync(
                    identity => identity.AddPerson("bea", "Bea", "Kessler"),
                    club =>
                        club.AddVenue("saal", "Festsaal")
                            .AddKeyHolding("bea-saal-earlier", "saal", "bea", HeldSince2024)
                            .AddKeyHolding(
                                "bea-saal-later",
                                "saal",
                                "bea",
                                HeldSince2026,
                                EndsNextSummer
                            ),
                    ct
                );

                var result = await ReadAsync(ctx, ct);

                var holder = Assert.Single(VenueNamed(result, "Festsaal").Holders);
                Assert.Equal(ctx.Identity.People.IdOf("bea"), holder.Person.PersonId);
                Assert.Equal(HeldSince2024, holder.SinceOn);

                await ctx
                    .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("bea-saal-earlier"))
                    .ToHaveSinceOn(HeldSince2024)
                    .KeyHolding(ctx.Club.KeyHoldings.IdOf("bea-saal-earlier"))
                    .ToHaveUntilOn(null)
                    .KeyHolding(ctx.Club.KeyHoldings.IdOf("bea-saal-later"))
                    .ToHaveUntilOn(EndsNextSummer)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAVenue_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await ArrangeAsync(
                    identity => identity.AddPerson("bea", "Bea", "Kessler"),
                    club =>
                        club.AddVenue("halle", "Turnhalle", 1)
                            .AddVenue("altes-lager", "Altes Lager", 2, archivedOn: ArchivedIn2021)
                            .AddKeyHolding("bea-halle", "halle", "bea", HeldSince2024)
                            .AddKeyHolding("bea-lager", "altes-lager", "bea", HeldSince2024),
                    ct
                );

                var result = await ReadAsync(ctx, ct);

                Assert.Equal(["Turnhalle"], result.Venues.Select(venue => venue.Name));
                await ctx
                    .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("bea-lager"))
                    .ToHaveUntilOn(null)
                    .AssertAsync(ct);
            }
        );
    }

    private Task<SeededContext> ArrangeAsync(
        Action<IdentitySeedBuilder> people,
        Action<ClubSeedBuilder> club,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                    {
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017);
                        people(identity);
                    })
                    .Club(club),
            ct
        );

    private static async Task<GetClubHubResponse> ReadAsync(SeededContext ctx, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    private static ClubVenueDto VenueNamed(GetClubHubResponse result, string name) =>
        Assert.Single(result.Venues, venue => venue.Name == name);
}
