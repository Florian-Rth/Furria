using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class PutBoardOffice : Endpoint<PutBoardOfficeRequest>
{
    private readonly BoardService _boardService;

    public PutBoardOffice(BoardService boardService)
    {
        _boardService = boardService;
    }

    public override void Configure()
    {
        Put("manage/board/offices/{boardOfficeId}");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(PutBoardOfficeRequest req, CancellationToken ct)
    {
        var result = await _boardService.UpdateOfficeAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static BoardOfficeUpdateCommand ToCommand(PutBoardOfficeRequest req) =>
        new()
        {
            BoardOfficeId = req.BoardOfficeId,
            Name = req.Name,
            SortOrder = req.SortOrder,
        };
}

public sealed record PutBoardOfficeRequest
{
    [RouteParam]
    public required int BoardOfficeId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }
}

public sealed class PutBoardOfficeValidator : Validator<PutBoardOfficeRequest>
{
    public PutBoardOfficeValidator()
    {
        RuleFor(request => request.BoardOfficeId).GreaterThan(0);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(BoardLimits.NameLength);
        RuleFor(request => request.SortOrder)
            .InclusiveBetween(BoardLimits.MinSortOrder, BoardLimits.MaxSortOrder);
    }
}
