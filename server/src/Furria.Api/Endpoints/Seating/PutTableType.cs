using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Core.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Seating;

public sealed class PutTableType : Endpoint<PutTableTypeRequest>
{
    private readonly SeatingService _seatingService;

    public PutTableType(SeatingService seatingService)
    {
        _seatingService = seatingService;
    }

    public override void Configure()
    {
        Put("seating/table-types/{tableTypeId}");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PutTableTypeRequest req, CancellationToken ct)
    {
        var result = await _seatingService.UpdateTableTypeAsync(
            req.TableTypeId,
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

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutTableTypeRequest
{
    [RouteParam]
    public required int TableTypeId { get; init; }

    public required string Name { get; init; }

    public required TableShape Shape { get; init; }

    public required int LengthCm { get; init; }

    public required int WidthCm { get; init; }

    public required bool SeatsAtEnds { get; init; }
}

public sealed class PutTableTypeValidator : Validator<PutTableTypeRequest>
{
    public PutTableTypeValidator()
    {
        RuleFor(request => request.TableTypeId).GreaterThan(0);
        Include(
            new TableTypeShapeValidator<PutTableTypeRequest>(
                request => request.Name,
                request => request.Shape,
                request => request.LengthCm,
                request => request.WidthCm
            )
        );
    }
}
