using FastEndpoints;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class GetClaimWindowStatus : EndpointWithoutRequest<GetClaimWindowStatusResponse>
{
    private readonly ClaimWindowService _claimWindowService;

    public GetClaimWindowStatus(ClaimWindowService claimWindowService)
    {
        _claimWindowService = claimWindowService;
    }

    public override void Configure()
    {
        Get("auth/claim-window");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var window = await _claimWindowService.GetOpenWindowAsync(ct);

        await Send.OkAsync(
            new GetClaimWindowStatusResponse
            {
                IsOpen = window is not null,
                ClosesAt = window?.ClosesAt,
            },
            cancellation: ct
        );
    }
}

public sealed record GetClaimWindowStatusResponse
{
    public required bool IsOpen { get; init; }

    public required DateTimeOffset? ClosesAt { get; init; }
}
