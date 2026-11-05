using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Core.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Seating;

public sealed class PostTableType : Endpoint<PostTableTypeRequest, PostTableTypeResponse>
{
    private readonly SeatingService _seatingService;

    public PostTableType(SeatingService seatingService)
    {
        _seatingService = seatingService;
    }

    public override void Configure()
    {
        Post("seating/table-types");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PostTableTypeRequest req, CancellationToken ct)
    {
        var result = await _seatingService.CreateTableTypeAsync(
            new TableTypeCommand
            {
                Name = req.Name,
                Shape = req.Shape,
                LengthCm = req.LengthCm,
                WidthCm = req.WidthCm,
                SeatsAtEnds = req.SeatsAtEnds,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostTableTypeResponse { TableTypeId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostTableTypeRequest
{
    public required string Name { get; init; }

    public required TableShape Shape { get; init; }

    public required int LengthCm { get; init; }

    public required int WidthCm { get; init; }

    public required bool SeatsAtEnds { get; init; }
}

public sealed class PostTableTypeValidator : Validator<PostTableTypeRequest>
{
    public PostTableTypeValidator()
    {
        Include(
            new TableTypeShapeValidator<PostTableTypeRequest>(
                request => request.Name,
                request => request.Shape,
                request => request.LengthCm,
                request => request.WidthCm
            )
        );
    }
}

public sealed record PostTableTypeResponse
{
    public required int TableTypeId { get; init; }
}
