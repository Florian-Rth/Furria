using FastEndpoints;
using Furria.Application.Push;
using Microsoft.Extensions.Options;

namespace Furria.Api.Endpoints.Push;

public sealed class GetPushKey : EndpointWithoutRequest<GetPushKeyResponse>
{
    private readonly IOptions<PushOptions> _pushOptions;

    public GetPushKey(IOptions<PushOptions> pushOptions)
    {
        _pushOptions = pushOptions;
    }

    public override void Configure()
    {
        Get("push/key");
    }

    public override Task HandleAsync(CancellationToken ct) =>
        Send.OkAsync(
            new GetPushKeyResponse { PublicKey = _pushOptions.Value.VapidPublicKey },
            cancellation: ct
        );
}

public sealed record GetPushKeyResponse
{
    public required string PublicKey { get; init; }
}
