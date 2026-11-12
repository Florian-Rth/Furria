using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class DeleteStatementById : Endpoint<DeleteStatementByIdRequest>
{
    private readonly StatementPoolService _statementPoolService;

    public DeleteStatementById(StatementPoolService statementPoolService)
    {
        _statementPoolService = statementPoolService;
    }

    public override void Configure()
    {
        Delete("manage/group-matcher/statements/{statementId}");
        Definition.RequirePermission(FurriaPermissions.GroupMatcherManage);
    }

    public override async Task HandleAsync(DeleteStatementByIdRequest req, CancellationToken ct)
    {
        var result = await _statementPoolService.DeleteAsync(req.StatementId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteStatementByIdRequest
{
    [RouteParam]
    public required int StatementId { get; init; }
}

public sealed class DeleteStatementByIdValidator : Validator<DeleteStatementByIdRequest>
{
    public DeleteStatementByIdValidator()
    {
        RuleFor(request => request.StatementId).GreaterThan(0);
    }
}
