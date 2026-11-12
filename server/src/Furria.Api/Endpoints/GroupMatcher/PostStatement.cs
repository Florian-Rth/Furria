using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PostStatement : Endpoint<PostStatementRequest, PostStatementResponse>
{
    private readonly StatementPoolService _statementPoolService;

    public PostStatement(StatementPoolService statementPoolService)
    {
        _statementPoolService = statementPoolService;
    }

    public override void Configure()
    {
        Post("manage/group-matcher/statements");
        Definition.RequirePermission(FurriaPermissions.GroupMatcherManage);
    }

    public override async Task HandleAsync(PostStatementRequest req, CancellationToken ct)
    {
        var added = await _statementPoolService.AddAsync(req.Text, ct);
        if (!added.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(added.Error, ct);
            return;
        }

        await Send.OkAsync(new() { StatementId = added.Value }, cancellation: ct);
    }
}

public sealed record PostStatementRequest
{
    public required string Text { get; init; }
}

public sealed class PostStatementValidator : Validator<PostStatementRequest>
{
    public PostStatementValidator()
    {
        RuleFor(request => request.Text).NotEmpty().MaximumLength(MatcherStatement.MaxTextLength);
    }
}

public sealed record PostStatementResponse
{
    public required int StatementId { get; init; }
}
