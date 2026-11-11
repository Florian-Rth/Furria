using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PostStatementRejection : Endpoint<PostStatementRejectionRequest>
{
    private readonly StatementPoolService _statementPoolService;

    public PostStatementRejection(StatementPoolService statementPoolService)
    {
        _statementPoolService = statementPoolService;
    }

    public override void Configure()
    {
        Post("manage/group-matcher/statements/{statementId}/rejection");
        Definition.RequirePermission(FurriaPermissions.GroupMatcherManage);
    }

    public override async Task HandleAsync(PostStatementRejectionRequest req, CancellationToken ct)
    {
        var result = await _statementPoolService.RejectAsync(req.StatementId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PostStatementRejectionRequest
{
    [RouteParam]
    public required int StatementId { get; init; }
}

public sealed class PostStatementRejectionValidator : Validator<PostStatementRejectionRequest>
{
    public PostStatementRejectionValidator()
    {
        RuleFor(request => request.StatementId).GreaterThan(0);
    }
}
