using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PostStatementProposal
    : Endpoint<PostStatementProposalRequest, PostStatementProposalResponse>
{
    private readonly GroupMatcherService _groupMatcherService;
    private readonly PermissionAuthorizer _authorizer;

    public PostStatementProposal(
        GroupMatcherService groupMatcherService,
        PermissionAuthorizer authorizer
    )
    {
        _groupMatcherService = groupMatcherService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("groups/{groupId}/group-matcher/proposals");
    }

    public override async Task HandleAsync(PostStatementProposalRequest req, CancellationToken ct)
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

        var proposed = await _groupMatcherService.ProposeAsync(req.GroupId, req.Text, ct);
        if (!proposed.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(proposed.Error, ct);
            return;
        }

        await Send.OkAsync(new() { StatementId = proposed.Value }, cancellation: ct);
    }
}

public sealed record PostStatementProposalRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required string Text { get; init; }
}

public sealed class PostStatementProposalValidator : Validator<PostStatementProposalRequest>
{
    public PostStatementProposalValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.Text).NotEmpty().MaximumLength(MatcherStatement.MaxTextLength);
    }
}

public sealed record PostStatementProposalResponse
{
    public required int StatementId { get; init; }
}
