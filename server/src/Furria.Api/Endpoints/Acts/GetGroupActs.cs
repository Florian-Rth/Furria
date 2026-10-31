using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetGroupActs : Endpoint<GetGroupActsRequest, GetGroupActsResponse>
{
    private readonly ActStudioService _studioService;

    public GetGroupActs(ActStudioService studioService)
    {
        _studioService = studioService;
    }

    public override void Configure()
    {
        Get("groups/{groupId}/acts");
    }

    public override async Task HandleAsync(GetGroupActsRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _studioService.GetGroupActsAsync(accountId.Value, req.GroupId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetGroupActsResponse
            {
                RelevantSessionYear = result.Value.RelevantSessionYear,
                Acts = [.. result.Value.Acts.Select(ToDto)],
            },
            cancellation: ct
        );
    }

    private static GroupActDto ToDto(GroupActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            SessionYear = act.SessionYear,
            Closed = act.IsClosed,
            Archived = act.IsArchived,
            CastSize = act.CastSize,
            ViewerInCast = act.ViewerInCast,
        };
}

public sealed record GetGroupActsRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class GetGroupActsValidator : Validator<GetGroupActsRequest>
{
    public GetGroupActsValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}

public sealed record GetGroupActsResponse
{
    public required int RelevantSessionYear { get; init; }

    public required IReadOnlyList<GroupActDto> Acts { get; init; }
}

public sealed record GroupActDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int SessionYear { get; init; }

    public required bool Closed { get; init; }

    public required bool Archived { get; init; }

    public required int CastSize { get; init; }

    public required bool ViewerInCast { get; init; }
}
