using Furria.Infrastructure.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace Furria.Api.Tests.TicketRequests;

public sealed class PastTicketRequestPurgeTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset AtTheGala = new(2027, 1, 16, 18, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset PastMidnight = new(2027, 1, 17, 1, 30, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset LateThatEvening = new(
        2027,
        1,
        16,
        22,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset NextMorning = new(2027, 1, 17, 8, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AnHourPastMidnight = new(
        2027,
        1,
        17,
        0,
        30,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PastTicketRequestPurgeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteTheRequest_When_ItsEveningWasYesterday()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            NextMorning,
            async () =>
            {
                var ctx = await BuildClubAsync(endsAt: null, ct);

                await SweepAsync(ct);

                await ctx
                    .Expected.TicketRequests()
                    .ToHaveIds(ctx.Club.TicketRequests.IdOf("ida-later"))
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheRequest_When_ItsEveningIsOverButItsDayIsNot()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            LateThatEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(endsAt: null, ct);

                await SweepAsync(ct);

                await ctx.Expected.TicketRequests().ToHaveCount(2).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheRequest_When_ItsEveningRunsPastMidnight()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AnHourPastMidnight,
            async () =>
            {
                var ctx = await BuildClubAsync(PastMidnight, ct);

                await SweepAsync(ct);

                await ctx.Expected.TicketRequests().ToHaveCount(2).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_DeleteTheRequest_When_ItsEveningEndedPastMidnight()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            PastMidnight,
            async () =>
            {
                var ctx = await BuildClubAsync(PastMidnight, ct);

                await SweepAsync(ct);

                await ctx.Expected.TicketRequests().ToHaveCount(1).AssertAsync(ct);
            }
        );
    }

    private Task SweepAsync(CancellationToken ct) =>
        _fixture
            .Services.GetServices<IHostedService>()
            .OfType<PastTicketRequestPurge>()
            .Single()
            .SweepAsync(ct);

    private Task<SeededContext> BuildClubAsync(DateTimeOffset? endsAt, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("buergerhaus", "Bürgerhaus")
                        .AddEvent(
                            "gala",
                            "1. Prunksitzung",
                            AtTheGala,
                            "buergerhaus",
                            endsAt: endsAt
                        )
                        .AddEvent(
                            "later-gala",
                            "2. Prunksitzung",
                            AtTheGala.AddDays(7),
                            "buergerhaus"
                        )
                        .AddTicketRequest("mia-gala", "gala", "Mia Gast", "mia@guest.test")
                        .AddTicketRequest("ida-later", "later-gala", "Ida Gast", "ida@guest.test")
                ),
            ct
        );
}
