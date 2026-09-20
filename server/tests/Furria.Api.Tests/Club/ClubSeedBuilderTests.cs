using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class ClubSeedBuilderTests
{
    private static readonly DateTimeOffset AtTheWinterball = new(
        2026,
        11,
        11,
        11,
        11,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public ClubSeedBuilderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseTheArrangement_When_AKalendereintragIsArrangedBeforeItsSliceLands()
    {
        var ct = TestContext.Current.CancellationToken;

        var refusal = await Assert.ThrowsAsync<NotSupportedException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Club(club =>
                        club.AddCalendarEntry("sessionsauftakt", "Sessionsauftakt", AtTheWinterball)
                    ),
                ct
            )
        );

        Assert.Contains(
            nameof(ClubSeedBuilder.AddCalendarEntry),
            refusal.Message,
            StringComparison.Ordinal
        );
    }
}
