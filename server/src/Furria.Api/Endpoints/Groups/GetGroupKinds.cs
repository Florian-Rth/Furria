using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetGroupKinds : EndpointWithoutRequest<GetGroupKindsResponse>
{
    private readonly GroupKindService _groupKindService;

    public GetGroupKinds(GroupKindService groupKindService)
    {
        _groupKindService = groupKindService;
    }

    public override void Configure()
    {
        Get("group-kinds");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
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
