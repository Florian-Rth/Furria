using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class DeleteStatementProposalById : Endpoint<DeleteStatementProposalByIdRequest>
{
    private readonly GroupMatcherService _groupMatcherService;
    private readonly PermissionAuthorizer _authorizer;

    public DeleteStatementProposalById(
        GroupMatcherService groupMatcherService,
        PermissionAuthorizer authorizer
    )
    {
        _groupMatcherService = groupMatcherService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Delete("groups/{groupId}/group-matcher/proposals/{statementId}");
    }

    public override async Task HandleAsync(
        DeleteStatementProposalByIdRequest req,
        CancellationToken ct
    )
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

        var result = await _groupMatcherService.WithdrawProposalAsync(
            req.GroupId,
            req.StatementId,
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

public sealed record DeleteStatementProposalByIdRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    [RouteParam]
    public required int StatementId { get; init; }
}

public sealed class DeleteStatementProposalByIdValidator
    : Validator<DeleteStatementProposalByIdRequest>
{
    public DeleteStatementProposalByIdValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.StatementId).GreaterThan(0);
    }
}
