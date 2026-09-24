using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetGroupKinds : EndpointWithoutRequest<GetGroupKindsResponse>
{
    private readonly GroupKindService _groupKindService;
    private readonly PermissionAuthorizer _authorizer;

    public GetGroupKinds(GroupKindService groupKindService, PermissionAuthorizer authorizer)
    {
        _groupKindService = groupKindService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("group-kinds");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.IsAffiliatedOrGroupAdminAsync(accountId.Value, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var kinds = await _groupKindService.GetRunningKindsAsync(ct);

        await Send.OkAsync(ToResponse(kinds), cancellation: ct);
    }

    private static GetGroupKindsResponse ToResponse(IReadOnlyList<RunningGroupKind> kinds) =>
        new() { Kinds = [.. kinds.Select(ToDto)] };

    private static RunningGroupKindDto ToDto(RunningGroupKind kind) =>
        new() { GroupKindId = kind.GroupKindId, Name = kind.Name };
}

public sealed record GetGroupKindsResponse
{
    public required IReadOnlyList<RunningGroupKindDto> Kinds { get; init; }
}

public sealed record RunningGroupKindDto
{
    public required int GroupKindId { get; init; }

    public required string Name { get; init; }
}
