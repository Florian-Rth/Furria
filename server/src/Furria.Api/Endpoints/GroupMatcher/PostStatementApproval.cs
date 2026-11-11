using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PostStatementApproval : Endpoint<PostStatementApprovalRequest>
{
    private readonly StatementPoolService _statementPoolService;

    public PostStatementApproval(StatementPoolService statementPoolService)
    {
        _statementPoolService = statementPoolService;
    }

    public override void Configure()
    {
        Post("manage/group-matcher/statements/{statementId}/approval");
        Definition.RequirePermission(FurriaPermissions.GroupMatcherManage);
    }

    public override async Task HandleAsync(PostStatementApprovalRequest req, CancellationToken ct)
    {
        var result = await _statementPoolService.ApproveAsync(req.StatementId, req.Text, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PostStatementApprovalRequest
{
    [RouteParam]
    public required int StatementId { get; init; }

    public string? Text { get; init; }
}

public sealed class PostStatementApprovalValidator : Validator<PostStatementApprovalRequest>
{
    public PostStatementApprovalValidator()
    {
        RuleFor(request => request.StatementId).GreaterThan(0);
        RuleFor(request => request.Text)
            .NotEmpty()
            .MaximumLength(MatcherStatement.MaxTextLength)
            .When(request => request.Text is not null);
    }
}
