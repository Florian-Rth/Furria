using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PutStatementText : Endpoint<PutStatementTextRequest>
{
    private readonly StatementPoolService _statementPoolService;

    public PutStatementText(StatementPoolService statementPoolService)
    {
        _statementPoolService = statementPoolService;
    }

    public override void Configure()
    {
        Put("manage/group-matcher/statements/{statementId}/text");
        Definition.RequirePermission(FurriaPermissions.GroupMatcherManage);
    }

    public override async Task HandleAsync(PutStatementTextRequest req, CancellationToken ct)
    {
        var result = await _statementPoolService.RewordAsync(req.StatementId, req.Text, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutStatementTextRequest
{
    [RouteParam]
    public required int StatementId { get; init; }

    public required string Text { get; init; }
}

public sealed class PutStatementTextValidator : Validator<PutStatementTextRequest>
{
    public PutStatementTextValidator()
    {
        RuleFor(request => request.StatementId).GreaterThan(0);
        RuleFor(request => request.Text).NotEmpty().MaximumLength(MatcherStatement.MaxTextLength);
    }
}
