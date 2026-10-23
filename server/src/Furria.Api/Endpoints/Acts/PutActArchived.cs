using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActArchived : Endpoint<PutActArchivedRequest>
{
    private readonly ActService _actService;
    private readonly ActAccess _actAccess;

    public PutActArchived(ActService actService, ActAccess actAccess)
    {
        _actService = actService;
        _actAccess = actAccess;
    }

    public override void Configure()
    {
        Put("acts/{actId}/archived");
    }

    public override async Task HandleAsync(PutActArchivedRequest req, CancellationToken ct)
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

        var result = await _actService.SetArchivedAsync(
            scope,
            new SetActArchivedCommand { ActId = req.ActId, Archived = req.Archived },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutActArchivedRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required bool Archived { get; init; }
}

public sealed class PutActArchivedValidator : Validator<PutActArchivedRequest>
{
    public PutActArchivedValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
    }
}
