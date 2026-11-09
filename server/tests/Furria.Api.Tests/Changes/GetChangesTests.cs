using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Changes;

public sealed class GetChangesTests : IClassFixture<ApiTestFixture>
{
    private const string ChangesRoute = "api/changes";
    private const string AnnouncementSeen = "announcementSeen";
    private const string Group = "group";

    private static readonly TimeSpan Patience = TimeSpan.FromSeconds(15);

    private readonly ApiTestFixture _fixture;

    public GetChangesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenAnUnbufferedStreamOfLines_When_ASignedInAccountConnects()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("ben")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ben", ct);

        using var response = await client.GetAsync(
            ChangesRoute,
            HttpCompletionOption.ResponseHeadersRead,
            ct
        );
        using var lines = new StreamReader(await response.Content.ReadAsStreamAsync(ct));
        var first = await lines.ReadLineAsync(ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/x-ndjson", response.Content.Headers.ContentType?.MediaType);
        Assert.True(response.Headers.CacheControl?.NoCache);
        Assert.Equal(["no"], response.Headers.GetValues("X-Accel-Buffering"));
        Assert.Equal("""{"kind":"ready"}""", first);
    }

    [Fact]
    public async Task Should_StreamTheChangedGroup_When_AnotherAccountSavesTheGroupInfo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                            .AddAccount("ben")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", "Die Garde tanzt seit 1971.")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
                    ),
            ct
        );
        var writer = await ctx.Identity.ClientForAsync("anna", ct);
        await using var feed = await FeedReader.OpenAsync(
            await ctx.Identity.ClientForAsync("ben", ct),
            ct
        );
        await _fixture.ChangeListenerListeningAsync(ct);
        await MarkAnnouncementsSeenAsync(writer);
        await feed.UntilChangedAsync(AnnouncementSeen, ct);

        await writer.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = "Wir tanzen dienstags.",
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
                Icon = null,
            }
        );

        await feed.UntilChangedAsync(Group, ct);
    }

    [Fact]
    public async Task Should_StreamTheSeenAnnouncements_When_TheMarkIsWrittenInBulk()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna").AddAccount("ben")),
            ct
        );
        var writer = await ctx.Identity.ClientForAsync("anna", ct);
        await using var feed = await FeedReader.OpenAsync(
            await ctx.Identity.ClientForAsync("ben", ct),
            ct
        );
        await _fixture.ChangeListenerListeningAsync(ct);

        await MarkAnnouncementsSeenAsync(writer);

        await feed.UntilChangedAsync(AnnouncementSeen, ct);
    }

    [Fact]
    public async Task Should_StreamThatEverythingChanged_When_TheListenerHadToReconnect()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("ben")),
            ct
        );
        await using var feed = await FeedReader.OpenAsync(
            await ctx.Identity.ClientForAsync("ben", ct),
            ct
        );

        await _fixture.CutChangeListenerAsync(ct);

        await feed.UntilEverythingChangedAsync(ct);
    }

    private static async Task MarkAnnouncementsSeenAsync(HttpClient writer)
    {
        var response = await writer.PUTAsync<
            PutMyLastSeenAnnouncement,
            PutMyLastSeenAnnouncementRequest
        >(new() { SeenUpTo = null });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private sealed class FeedReader : IAsyncDisposable
    {
        private readonly HttpResponseMessage _response;
        private readonly StreamReader _lines;

        private FeedReader(HttpResponseMessage response, StreamReader lines)
        {
            _response = response;
            _lines = lines;
        }

        public static async Task<FeedReader> OpenAsync(HttpClient client, CancellationToken ct)
        {
            var response = await client.GetAsync(
                ChangesRoute,
                HttpCompletionOption.ResponseHeadersRead,
                ct
            );
            var feed = new FeedReader(
                response,
                new StreamReader(await response.Content.ReadAsStreamAsync(ct))
            );
            await feed.UntilAsync(line => KindOf(line) == "ready", "the ready line", ct);
            return feed;
        }

        public Task UntilChangedAsync(string change, CancellationToken ct) =>
            UntilAsync(
                line =>
                    KindOf(line) == "changes"
                    && line.GetProperty("changes") is { ValueKind: JsonValueKind.Array } changes
                    && changes.EnumerateArray().Any(named => named.GetString() == change),
                $"a change of {change}",
                ct
            );

        public Task UntilEverythingChangedAsync(CancellationToken ct) =>
            UntilAsync(
                line =>
                    KindOf(line) == "changes"
                    && line.GetProperty("changes") is { ValueKind: JsonValueKind.String } all
                    && all.GetString() == "all",
                "a change of everything",
                ct
            );

        public ValueTask DisposeAsync()
        {
            _lines.Dispose();
            _response.Dispose();
            return ValueTask.CompletedTask;
        }

        private async Task UntilAsync(
            Func<JsonElement, bool> isAwaited,
            string awaited,
            CancellationToken ct
        )
        {
            using var patience = CancellationTokenSource.CreateLinkedTokenSource(ct);
            patience.CancelAfter(Patience);
            try
            {
                while (await _lines.ReadLineAsync(patience.Token) is { } line)
                {
                    using var parsed = JsonDocument.Parse(line);
                    if (isAwaited(parsed.RootElement))
                        return;
                }
            }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            {
                throw new TimeoutException($"The change feed sent no {awaited} in {Patience}");
            }

            throw new InvalidOperationException($"The change feed ended before {awaited}");
        }

        private static string? KindOf(JsonElement line) => line.GetProperty("kind").GetString();
    }
}
