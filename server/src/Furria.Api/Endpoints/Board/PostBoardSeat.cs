using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class PostBoardSeat : Endpoint<PostBoardSeatRequest, PostBoardSeatResponse>
{
    private readonly BoardService _boardService;
    private readonly PermissionAuthorizer _authorizer;

    public PostBoardSeat(BoardService boardService, PermissionAuthorizer authorizer)
    {
        _boardService = boardService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("manage/board/offices/{boardOfficeId}/seats");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(PostBoardSeatRequest req, CancellationToken ct)
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

        var result = await _boardService.OpenSeatAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static BoardSeatOpenCommand ToCommand(PostBoardSeatRequest req) =>
        new()
        {
            BoardOfficeId = req.BoardOfficeId,
            PersonId = req.PersonId,
            SinceOn = req.SinceOn,
        };

    private static PostBoardSeatResponse ToResponse(int boardSeatId) =>
        new() { BoardSeatId = boardSeatId };
}

public sealed record PostBoardSeatRequest
{
    [RouteParam]
    public required int BoardOfficeId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly SinceOn { get; init; }
}

public sealed class PostBoardSeatValidator : Validator<PostBoardSeatRequest>
{
    public PostBoardSeatValidator()
    {
        RuleFor(request => request.BoardOfficeId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.SinceOn).NotEmpty();
    }
}

public sealed record PostBoardSeatResponse
{
    public required int BoardSeatId { get; init; }
}
