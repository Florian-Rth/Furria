using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class EndBoardSeat : Endpoint<EndBoardSeatRequest>
{
    private readonly BoardService _boardService;
    private readonly PermissionAuthorizer _authorizer;

    public EndBoardSeat(BoardService boardService, PermissionAuthorizer authorizer)
    {
        _boardService = boardService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("manage/board/offices/{boardOfficeId}/seats/{boardSeatId}/end");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(EndBoardSeatRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (
            !await _authorizer.MaySeatIntoOfficeAsync(
                _boardService,
                accountId.Value,
                req.BoardOfficeId,
                ct
            )
        )
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _boardService.EndSeatAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static BoardSeatEndCommand ToCommand(EndBoardSeatRequest req) =>
        new()
        {
            BoardOfficeId = req.BoardOfficeId,
            BoardSeatId = req.BoardSeatId,
            EndedOn = req.EndedOn,
        };
}

public sealed record EndBoardSeatRequest
{
    [RouteParam]
    public required int BoardOfficeId { get; init; }

    [RouteParam]
    public required int BoardSeatId { get; init; }

    public required DateOnly EndedOn { get; init; }
}

public sealed class EndBoardSeatValidator : Validator<EndBoardSeatRequest>
{
    public EndBoardSeatValidator()
    {
        RuleFor(request => request.BoardOfficeId).GreaterThan(0);
        RuleFor(request => request.BoardSeatId).GreaterThan(0);
        RuleFor(request => request.EndedOn).NotEmpty();
    }
}
