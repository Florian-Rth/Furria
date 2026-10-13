using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Operations;
using Furria.Api.Tests.Auth;
using Furria.Application.Operations;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class GetSystemLogsTests : IClassFixture<ApiTestFixture>
{
    private const string LoginFailed = "Login failed for {Email}: {LoginFailureReason}";

    private static readonly TimeSpan SinkFlushTimeout = TimeSpan.FromSeconds(20);

    private readonly ApiTestFixture _fixture;

    public GetSystemLogsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PageNewestFirst_When_MoreEntriesMatchThanTaken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var marker = Marker();
        var oldest = await LogAsync(LogSource.Api, LogEntryLevel.Information, $"{marker} one", ct);
        var middle = await LogAsync(LogSource.Api, LogEntryLevel.Information, $"{marker} two", ct);
        var newest = await LogAsync(
            LogSource.Api,
            LogEntryLevel.Information,
            $"{marker} three",
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, first) = await client.GETAsync<
            GetSystemLogs,
            GetSystemLogsRequest,
            GetSystemLogsResponse
        >(new() { Search = marker, Take = 2 });
        var (_, second) = await client.GETAsync<
            GetSystemLogs,
            GetSystemLogsRequest,
            GetSystemLogsResponse
        >(
            new()
            {
                Search = marker,
                Take = 2,
                Before = first.NextBefore,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal([newest, middle], first.Entries.Select(entry => entry.Id));
        Assert.Equal(middle, first.NextBefore);
        Assert.Equal([oldest], second.Entries.Select(entry => entry.Id));
        Assert.Null(second.NextBefore);
    }

    [Fact]
    public async Task Should_KeepToOneSource_When_ASourceIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var marker = Marker();
        await LogAsync(LogSource.Api, LogEntryLevel.Information, $"{marker} api", ct);
        var worker = await LogAsync(
            LogSource.MediaWorker,
            LogEntryLevel.Information,
            $"{marker} worker",
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetSystemLogs,
            GetSystemLogsRequest,
            GetSystemLogsResponse
        >(new() { Search = marker, Source = LogSource.MediaWorker });

        var entry = Assert.Single(result.Entries);
        Assert.Equal(worker, entry.Id);
        Assert.Equal(LogSource.MediaWorker, entry.Source);
    }

    [Fact]
    public async Task Should_LeaveOutLowerLevels_When_AMinimumLevelIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var marker = Marker();
        await LogAsync(LogSource.Api, LogEntryLevel.Information, $"{marker} info", ct);
        var warning = await LogAsync(LogSource.Api, LogEntryLevel.Warning, $"{marker} warn", ct);
        var fatal = await LogAsync(LogSource.Api, LogEntryLevel.Fatal, $"{marker} fatal", ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetSystemLogs,
            GetSystemLogsRequest,
            GetSystemLogsResponse
        >(new() { Search = marker, MinimumLevel = LogEntryLevel.Warning });

        Assert.Equal([fatal, warning], result.Entries.Select(entry => entry.Id));
    }

    [Fact]
    public async Task Should_MatchMessageOrCategoryIgnoringCase_When_Searching()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var marker = Marker();
        var inMessage = await LogAsync(
            LogSource.Api,
            LogEntryLevel.Information,
            $"Found {marker.ToUpperInvariant()}",
            ct
        );
        var inCategory = await _fixture.WriteLogEntryDirectlyAsync(
            LogSource.Api,
            LogEntryLevel.Information,
            _fixture.TimeProvider.GetUtcNow(),
            "Nothing to see",
            $"Furria.Tests.{marker}",
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetSystemLogs,
            GetSystemLogsRequest,
            GetSystemLogsResponse
        >(new() { Search = marker.ToLowerInvariant() });

        Assert.Equal([inCategory, inMessage], result.Entries.Select(entry => entry.Id));
    }

    [Fact]
    public async Task Should_ShowWhatTheApiLogged_When_TheEventReachedTheDatabase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var email = InvitationSteps.UniqueContactEmail("nobody");
        await _fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new() { Email = email, Password = "Wrong-Password-1!" }
            );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var entry = await Polling.UntilAsync(
            async _ =>
            {
                var (_, result) = await client.GETAsync<
                    GetSystemLogs,
                    GetSystemLogsRequest,
                    GetSystemLogsResponse
                >(new() { Search = email });
                return result.Entries.SingleOrDefault();
            },
            SinkFlushTimeout,
            "The failed login never reached the stored log",
            ct
        );

        Assert.Equal(LogSource.Api, entry.Source);
        Assert.Equal(LogEntryLevel.Information, entry.Level);
        Assert.Equal(LoginFailed, entry.Template);
        Assert.Contains(email, entry.Message, StringComparison.Ordinal);
    }

    private Task<long> LogAsync(
        LogSource source,
        LogEntryLevel level,
        string message,
        CancellationToken ct
    ) =>
        _fixture.WriteLogEntryDirectlyAsync(
            source,
            level,
            _fixture.TimeProvider.GetUtcNow(),
            message,
            ct: ct
        );

    private static string Marker() => $"marker-{Guid.NewGuid():N}";
}
