using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PutStance : Endpoint<PutStanceRequest>
{
    private readonly GroupMatcherService _groupMatcherService;
    private readonly PermissionAuthorizer _authorizer;

    public PutStance(GroupMatcherService groupMatcherService, PermissionAuthorizer authorizer)
    {
        _groupMatcherService = groupMatcherService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("groups/{groupId}/group-matcher/stances/{statementId}");
    }

    public override async Task HandleAsync(PutStanceRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanAdministerGroupAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _groupMatcherService.TakeStanceAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static TakeStanceCommand ToCommand(PutStanceRequest req) =>
        new()
        {
            GroupId = req.GroupId,
            StatementId = req.StatementId,
            Position = req.Position,
            Importance = req.Importance,
        };
}

public sealed record PutStanceRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    [RouteParam]
    public required int StatementId { get; init; }

    public required StancePosition Position { get; init; }

    public required int Importance { get; init; }
}

public sealed class PutStanceValidator : Validator<PutStanceRequest>
{
    public PutStanceValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.StatementId).GreaterThan(0);
        RuleFor(request => request.Position).IsInEnum();
        RuleFor(request => request.Importance)
            .InclusiveBetween(Stance.MinImportance, Stance.MaxImportance);
    }
}
