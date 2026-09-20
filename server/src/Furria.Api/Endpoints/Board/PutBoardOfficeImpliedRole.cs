using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class PutBoardOfficeImpliedRole : Endpoint<PutBoardOfficeImpliedRoleRequest>
{
    private readonly BoardService _boardService;

    public PutBoardOfficeImpliedRole(BoardService boardService)
    {
        _boardService = boardService;
    }

    public override void Configure()
    {
        Put("manage/board/offices/{boardOfficeId}/implied-role");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(
        PutBoardOfficeImpliedRoleRequest req,
        CancellationToken ct
    )
    {
        var result = await _boardService.SetImpliedRoleAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static BoardOfficeImpliedRoleCommand ToCommand(PutBoardOfficeImpliedRoleRequest req) =>
        new() { BoardOfficeId = req.BoardOfficeId, ImpliedRoleId = req.ImpliedRoleId };
}

public sealed record PutBoardOfficeImpliedRoleRequest
{
    [RouteParam]
    public required int BoardOfficeId { get; init; }

    public required int? ImpliedRoleId { get; init; }
}

public sealed class PutBoardOfficeImpliedRoleValidator : Validator<PutBoardOfficeImpliedRoleRequest>
{
    public PutBoardOfficeImpliedRoleValidator()
    {
        RuleFor(request => request.BoardOfficeId).GreaterThan(0);
        RuleFor(request => request.ImpliedRoleId)
            .GreaterThan(0)
            .When(request => request.ImpliedRoleId is not null);
    }
}
