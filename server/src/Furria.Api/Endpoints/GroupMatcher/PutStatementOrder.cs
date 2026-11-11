using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PutStatementOrder : Endpoint<PutStatementOrderRequest>
{
    private readonly StatementPoolService _statementPoolService;

    public PutStatementOrder(StatementPoolService statementPoolService)
    {
        _statementPoolService = statementPoolService;
    }

    public override void Configure()
    {
        Put("manage/group-matcher/statement-order");
        Definition.RequirePermission(FurriaPermissions.GroupMatcherManage);
    }

    public override async Task HandleAsync(PutStatementOrderRequest req, CancellationToken ct)
    {
        var result = await _statementPoolService.ReorderAsync(req.StatementIds, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutStatementOrderRequest
{
    public required IReadOnlyList<int> StatementIds { get; init; }
}

public sealed class PutStatementOrderValidator : Validator<PutStatementOrderRequest>
{
    public PutStatementOrderValidator()
    {
        RuleFor(request => request.StatementIds)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(ids => ids.Count <= MatcherStatement.MaxApproved)
            .WithMessage($"Höchstens {MatcherStatement.MaxApproved} Aussagen.")
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage("Jede Aussage darf nur einmal vorkommen.");
        RuleForEach(request => request.StatementIds).GreaterThan(0);
    }
}
