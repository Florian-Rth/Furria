using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class ArchiveBoardOffice : Endpoint<ArchiveBoardOfficeRequest>
{
    private readonly BoardService _boardService;

    public ArchiveBoardOffice(BoardService boardService)
    {
        _boardService = boardService;
    }

    public override void Configure()
    {
        Post("manage/board/offices/{boardOfficeId}/archive");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(ArchiveBoardOfficeRequest req, CancellationToken ct)
    {
        var result = await _boardService.ArchiveOfficeAsync(req.BoardOfficeId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record ArchiveBoardOfficeRequest
{
    [RouteParam]
    public required int BoardOfficeId { get; init; }
}

public sealed class ArchiveBoardOfficeValidator : Validator<ArchiveBoardOfficeRequest>
{
    public ArchiveBoardOfficeValidator()
    {
        RuleFor(request => request.BoardOfficeId).GreaterThan(0);
    }
}
