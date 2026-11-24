using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Operations;
using Furria.Application.Operations;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class GetSystemLogsTests : IClassFixture<ApiTestFixture>
{
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
