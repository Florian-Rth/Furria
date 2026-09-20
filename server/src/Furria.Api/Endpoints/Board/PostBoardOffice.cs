using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class PostBoardOffice : Endpoint<PostBoardOfficeRequest, PostBoardOfficeResponse>
{
    private readonly BoardService _boardService;

    public PostBoardOffice(BoardService boardService)
    {
        _boardService = boardService;
    }

    public override void Configure()
    {
        Post("manage/board/offices");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(PostBoardOfficeRequest req, CancellationToken ct)
    {
        var result = await _boardService.CreateOfficeAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static BoardOfficeCreateCommand ToCommand(PostBoardOfficeRequest req) =>
        new() { Name = req.Name, SortOrder = req.SortOrder };

    private static PostBoardOfficeResponse ToResponse(int boardOfficeId) =>
        new() { BoardOfficeId = boardOfficeId };
}

public sealed record PostBoardOfficeRequest
{
    public required string Name { get; init; }

    public required int SortOrder { get; init; }
}

public sealed class PostBoardOfficeValidator : Validator<PostBoardOfficeRequest>
{
    public PostBoardOfficeValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(BoardLimits.NameLength);
        RuleFor(request => request.SortOrder)
            .InclusiveBetween(BoardLimits.MinSortOrder, BoardLimits.MaxSortOrder);
    }
}

public sealed record PostBoardOfficeResponse
{
    public required int BoardOfficeId { get; init; }
}
