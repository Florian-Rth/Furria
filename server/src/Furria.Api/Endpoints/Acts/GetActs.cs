using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Api.Media;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActs : Endpoint<GetActsRequest, GetActsResponse>
{
    private readonly ActService _actService;
    private readonly ActAccess _actAccess;

    public GetActs(ActService actService, ActAccess actAccess)
    {
        _actService = actService;
        _actAccess = actAccess;
    }

    public override void Configure()
    {
        Get("acts");
    }

    public override async Task HandleAsync(GetActsRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var scope = await _actAccess.ScopeOfAsync(accountId.Value, ct);
        if (scope is null)
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var shown = await _actService.GetActsAsync(scope, req.Session, ct);

        await Send.OkAsync(
            new GetActsResponse
            {
                SessionYear = shown.SessionYear,
                SessionYears = shown.SessionYears,
                Acts = [.. shown.Acts.Select(ActSummaryDto.From)],
            },
            cancellation: ct
        );
    }
}

public sealed record GetActsRequest
{
    [QueryParam]
    public int? Session { get; init; }
}

public sealed class GetActsValidator : Validator<GetActsRequest>
{
    public GetActsValidator()
    {
        RuleFor(request => request.Session).GreaterThanOrEqualTo(ClubSession.EarliestSessionYear);
    }
}

public sealed record GetActsResponse
{
    public required int SessionYear { get; init; }

    public required IReadOnlyList<int> SessionYears { get; init; }

    public required IReadOnlyList<ActSummaryDto> Acts { get; init; }
}
