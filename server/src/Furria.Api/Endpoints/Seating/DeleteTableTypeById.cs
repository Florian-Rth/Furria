using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Seating;

public sealed class DeleteTableTypeById : Endpoint<DeleteTableTypeByIdRequest>
{
    private readonly SeatingService _seatingService;

    public DeleteTableTypeById(SeatingService seatingService)
    {
        _seatingService = seatingService;
    }

    public override void Configure()
    {
        Delete("seating/table-types/{tableTypeId}");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(DeleteTableTypeByIdRequest req, CancellationToken ct)
    {
        var result = await _seatingService.DeleteTableTypeAsync(req.TableTypeId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteTableTypeByIdRequest
{
    [RouteParam]
    public required int TableTypeId { get; init; }
}

public sealed class DeleteTableTypeByIdValidator : Validator<DeleteTableTypeByIdRequest>
{
    public DeleteTableTypeByIdValidator()
    {
        RuleFor(request => request.TableTypeId).GreaterThan(0);
    }
}
