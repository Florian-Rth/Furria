using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetMyActs : EndpointWithoutRequest<GetMyActsResponse>
{
    private readonly ActStudioService _studioService;

    public GetMyActs(ActStudioService studioService)
    {
        _studioService = studioService;
    }

    public override void Configure()
    {
        Get("acts/mine");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var acts = await _studioService.GetMyActsAsync(accountId.Value, ct);

        await Send.OkAsync(
            new GetMyActsResponse { Acts = [.. acts.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static MyActDto ToDto(MyActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            SessionYear = act.SessionYear,
            Group = ActGroupDto.From(act.Group),
        };
}

public sealed record GetMyActsResponse
{
    public required IReadOnlyList<MyActDto> Acts { get; init; }
}

public sealed record MyActDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int SessionYear { get; init; }

    public required ActGroupDto? Group { get; init; }
}
