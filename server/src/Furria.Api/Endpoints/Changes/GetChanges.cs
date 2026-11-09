using System.Diagnostics.Contracts;
using System.Text.Json;
using System.Text.Json.Serialization;
using FastEndpoints;
using Furria.Application.Changes;
using Microsoft.AspNetCore.Http.Features;

namespace Furria.Api.Endpoints.Changes;

public sealed class GetChanges : EndpointWithoutRequest<GetChangesResponse>
{
    private const string LinesContentType = "application/x-ndjson";

    private static readonly TimeSpan HeartbeatInterval = TimeSpan.FromSeconds(20);
    private static readonly JsonSerializerOptions LineJson = LineJsonOptions();
    private static readonly byte[] LineBreak = "\n"u8.ToArray();
    private static readonly GetChangesResponse ReadyLine = new() { Kind = ChangeLineKind.Ready };
    private static readonly GetChangesResponse PingLine = new() { Kind = ChangeLineKind.Ping };

    private readonly ChangeFeed _changeFeed;

    public GetChanges(ChangeFeed changeFeed)
    {
        _changeFeed = changeFeed;
    }

    public override void Configure()
    {
        Get("changes");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        using var subscription = _changeFeed.Subscribe();
        try
        {
            await StartLinesAsync(ct);
            await WriteLineAsync(ReadyLine, ct);
            while (true)
                await WriteLineAsync(await NextLineAsync(subscription, ct), ct);
        }
        catch (Exception) when (ct.IsCancellationRequested) { }
    }

    private async Task StartLinesAsync(CancellationToken ct)
    {
        var response = HttpContext.Response;
        response.StatusCode = StatusCodes.Status200OK;
        response.ContentType = LinesContentType;
        response.Headers.CacheControl = "no-cache";
        response.Headers["X-Accel-Buffering"] = "no";
        HttpContext.Features.Get<IHttpResponseBodyFeature>()?.DisableBuffering();
        await response.StartAsync(ct);
    }

    private async Task WriteLineAsync(GetChangesResponse line, CancellationToken ct)
    {
        var body = HttpContext.Response.Body;
        await JsonSerializer.SerializeAsync(body, line, LineJson, ct);
        await body.WriteAsync(LineBreak, ct);
        await body.FlushAsync(ct);
    }

    private static async Task<GetChangesResponse> NextLineAsync(
        ChangeSubscription subscription,
        CancellationToken ct
    )
    {
        using var heartbeatDue = CancellationTokenSource.CreateLinkedTokenSource(ct);
        heartbeatDue.CancelAfter(HeartbeatInterval);
        try
        {
            return ToLine(await subscription.ReadAsync(heartbeatDue.Token));
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            return PingLine;
        }
    }

    [Pure]
    private static GetChangesResponse ToLine(ChangeBatch batch) =>
        new()
        {
            Kind = ChangeLineKind.Changes,
            Changes = new ChangeListDto
            {
                IsEverything = batch.IsEverything,
                Changes = batch.Changes,
            },
        };

    private static JsonSerializerOptions LineJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));

        return options;
    }
}

public sealed record GetChangesResponse
{
    public required ChangeLineKind Kind { get; init; }

    public ChangeListDto? Changes { get; init; }
}

public enum ChangeLineKind
{
    Ready = 1,
    Changes = 2,
    Ping = 3,
}

[JsonConverter(typeof(ChangeListJsonConverter))]
public sealed record ChangeListDto
{
    public required bool IsEverything { get; init; }

    public required IReadOnlyList<DomainChange> Changes { get; init; }
}

public sealed class ChangeListJsonConverter : JsonConverter<ChangeListDto>
{
    private const string Everything = "all";

    public override ChangeListDto Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    ) =>
        reader.TokenType == JsonTokenType.String && reader.GetString() == Everything
            ? new ChangeListDto { IsEverything = true, Changes = [] }
            : new ChangeListDto
            {
                IsEverything = false,
                Changes =
                    JsonSerializer.Deserialize<IReadOnlyList<DomainChange>>(ref reader, options)
                    ?? [],
            };

    public override void Write(
        Utf8JsonWriter writer,
        ChangeListDto value,
        JsonSerializerOptions options
    )
    {
        if (value.IsEverything)
            writer.WriteStringValue(Everything);
        else
            JsonSerializer.Serialize(writer, value.Changes, options);
    }
}
