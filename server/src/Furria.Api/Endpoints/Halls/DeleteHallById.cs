using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed class DeleteHallById : Endpoint<DeleteHallByIdRequest>
{
    private readonly HallService _hallService;

    public DeleteHallById(HallService hallService)
    {
        _hallService = hallService;
    }

    public override void Configure()
    {
        Delete("halls/{hallId}");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(DeleteHallByIdRequest req, CancellationToken ct)
    {
        var result = await _hallService.DeleteHallAsync(req.HallId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteHallByIdRequest
{
    [RouteParam]
    public required int HallId { get; init; }
}

public sealed class DeleteHallByIdValidator : Validator<DeleteHallByIdRequest>
{
    public DeleteHallByIdValidator()
    {
        RuleFor(request => request.HallId).GreaterThan(0);
    }
}
