using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed class GetHallById : Endpoint<GetHallByIdRequest, GetHallByIdResponse>
{
    private readonly HallService _hallService;

    public GetHallById(HallService hallService)
    {
        _hallService = hallService;
    }

    public override void Configure()
    {
        Get("halls/{hallId}");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(GetHallByIdRequest req, CancellationToken ct)
    {
        var hall = await _hallService.GetHallAsync(req.HallId, ct);
        if (hall is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(hall), cancellation: ct);
    }

    private static GetHallByIdResponse ToResponse(HallDetails hall) =>
        new()
        {
            HallId = hall.HallId,
            VenueId = hall.VenueId,
            VenueName = hall.VenueName,
            Name = hall.Name,
            Document = HallDocumentDto.Of(hall.Document),
            Version = hall.Version,
        };
}

public sealed record GetHallByIdRequest
{
    [RouteParam]
    public required int HallId { get; init; }
}

public sealed class GetHallByIdValidator : Validator<GetHallByIdRequest>
{
    public GetHallByIdValidator()
    {
        RuleFor(request => request.HallId).GreaterThan(0);
    }
}

public sealed record GetHallByIdResponse
{
    public required int HallId { get; init; }

    public required int VenueId { get; init; }

    public required string VenueName { get; init; }

    public required string Name { get; init; }

    public required HallDocumentDto Document { get; init; }

    public required int Version { get; init; }
}
