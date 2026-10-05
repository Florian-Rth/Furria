using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class PutBoardOfficePublication : Endpoint<PutBoardOfficePublicationRequest>
{
    private readonly BoardService _boardService;

    public PutBoardOfficePublication(BoardService boardService)
    {
        _boardService = boardService;
    }

    public override void Configure()
    {
        Put("manage/board/offices/{boardOfficeId}/publication");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(
        PutBoardOfficePublicationRequest req,
        CancellationToken ct
    )
    {
        var result = await _boardService.SetPublicationAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static BoardOfficePublicationCommand ToCommand(PutBoardOfficePublicationRequest req) =>
        new() { BoardOfficeId = req.BoardOfficeId, IsPublic = req.IsPublic };
}

public sealed record PutBoardOfficePublicationRequest
{
    [RouteParam]
    public required int BoardOfficeId { get; init; }

    public required bool IsPublic { get; init; }
}

public sealed class PutBoardOfficePublicationValidator : Validator<PutBoardOfficePublicationRequest>
{
    public PutBoardOfficePublicationValidator()
    {
        RuleFor(request => request.BoardOfficeId).GreaterThan(0);
    }
}
