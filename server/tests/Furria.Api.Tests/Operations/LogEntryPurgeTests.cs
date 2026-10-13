using Furria.Application.Operations;
using Furria.Infrastructure.Logging;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class LogEntryPurgeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public LogEntryPurgeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepInformationThreeDaysAndWarningsThirtyDays_When_ThePurgeRuns()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var marker = Marker();
        var now = _fixture.TimeProvider.GetUtcNow();
        await LogAsync(LogEntryLevel.Information, now.AddDays(-4), $"{marker} old info", ct);
        await LogAsync(LogEntryLevel.Information, now.AddDays(-2), $"{marker} recent info", ct);
        await LogAsync(LogEntryLevel.Warning, now.AddDays(-29), $"{marker} recent warning", ct);
        await LogAsync(LogEntryLevel.Error, now.AddDays(-31), $"{marker} old error", ct);

        await _fixture.PurgeLogEntriesAsync(ct);

        await ctx
            .Expected.LogEntriesContaining(marker)
            .ToHoldExactly($"{marker} recent info", $"{marker} recent warning")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropTheOldestRows_When_TheTableOutgrowsItsCap()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var marker = Marker();
        var now = _fixture.TimeProvider.GetUtcNow();
        for (var number = 1; number <= 5; number++)
            await LogAsync(LogEntryLevel.Information, now, $"{marker} {number}", ct);
        await using var cappedHost = _fixture.HostWithSettings(
            new Dictionary<string, string>
            {
                [$"{SystemLogOptions.SectionName}:{nameof(SystemLogOptions.RowCap)}"] = "3",
            }
        );

        await ApiTestFixture.PurgeLogEntriesOnAsync(cappedHost, ct);

        await ctx
            .Expected.LogEntriesContaining(marker)
            .ToHoldNone($"{marker} 1", $"{marker} 2")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ForgetAMediaWorker_When_ItWasUnseenForADay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.BeatAsMediaWorkerAsync(ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(25),
            () => _fixture.PurgeLogEntriesAsync(ct)
        );

        await ctx.Expected.MediaWorkerHeartbeats().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepAMediaWorker_When_ItBeatRecently()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.BeatAsMediaWorkerAsync(ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(1),
            () => _fixture.PurgeLogEntriesAsync(ct)
        );

        await ctx.Expected.MediaWorkerHeartbeats().ToHaveCount(1).AssertAsync(ct);
    }

    private Task LogAsync(
        LogEntryLevel level,
        DateTimeOffset loggedAt,
        string message,
        CancellationToken ct
    ) => _fixture.WriteLogEntryDirectlyAsync(LogSource.Api, level, loggedAt, message, ct: ct);

    private static string Marker() => $"marker-{Guid.NewGuid():N}";
}
