using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class RestoreBoardOffice : Endpoint<RestoreBoardOfficeRequest>
{
    private readonly BoardService _boardService;

    public RestoreBoardOffice(BoardService boardService)
    {
        _boardService = boardService;
    }

    public override void Configure()
    {
        Post("manage/board/offices/{boardOfficeId}/restore");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(RestoreBoardOfficeRequest req, CancellationToken ct)
    {
        var result = await _boardService.RestoreOfficeAsync(req.BoardOfficeId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RestoreBoardOfficeRequest
{
    [RouteParam]
    public required int BoardOfficeId { get; init; }
}

public sealed class RestoreBoardOfficeValidator : Validator<RestoreBoardOfficeRequest>
{
    public RestoreBoardOfficeValidator()
    {
        RuleFor(request => request.BoardOfficeId).GreaterThan(0);
    }
}
