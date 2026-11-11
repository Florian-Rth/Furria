using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Operations;

public sealed class GetClaimWindow : EndpointWithoutRequest<GetClaimWindowResponse>
{
    private readonly ClaimWindowService _claimWindowService;

    public GetClaimWindow(ClaimWindowService claimWindowService)
    {
        _claimWindowService = claimWindowService;
    }

    public override void Configure()
    {
        Get("system/claim-window");
        Definition.RequirePermission(FurriaPermissions.ClaimWindowManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var overview = await _claimWindowService.GetOverviewAsync(ct);

        await Send.OkAsync(ToResponse(overview), cancellation: ct);
    }

    private static GetClaimWindowResponse ToResponse(ClaimWindowOverviewDetails overview) =>
        new()
        {
            Window = overview.Window is { } window
                ? new ClaimWindowDto { OpenedAt = window.OpenedAt, ClosesAt = window.ClosesAt }
                : null,
            Claims = [.. overview.Claims.Select(ToDto)],
        };

    private static ClaimWindowClaimSummaryDto ToDto(ClaimSummary claim) =>
        new()
        {
            PersonId = claim.PersonId,
            FirstName = claim.FirstName,
            LastName = claim.LastName,
            ClaimedAt = claim.ClaimedAt,
            HasAccount = claim.HasAccount,
        };
}

public sealed record GetClaimWindowResponse
{
    public required ClaimWindowDto? Window { get; init; }

    public required IReadOnlyList<ClaimWindowClaimSummaryDto> Claims { get; init; }
}

public sealed record ClaimWindowDto
{
    public required DateTimeOffset OpenedAt { get; init; }

    public required DateTimeOffset ClosesAt { get; init; }
}

public sealed record ClaimWindowClaimSummaryDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateTimeOffset ClaimedAt { get; init; }

    public required bool HasAccount { get; init; }
}
