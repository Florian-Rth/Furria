using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Core.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetBeerStock : Endpoint<GetBeerStockRequest, GetBeerStockResponse>
{
    private readonly BeerStockService _beerStockService;

    public GetBeerStock(BeerStockService beerStockService)
    {
        _beerStockService = beerStockService;
    }

    public override void Configure()
    {
        Get("beer-list/pots/{beerPotId}/stock");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(GetBeerStockRequest req, CancellationToken ct)
    {
        var result = await _beerStockService.GetStockAsync(req.BeerPotId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static GetBeerStockResponse ToResponse(BeerStockDetails stock) =>
        new()
        {
            Drinks = [.. stock.Drinks.Select(ToDto)],
            Movements = [.. stock.Movements.Select(ToDto)],
        };

    private static BeerDrinkStockDto ToDto(BeerDrinkStockSummary drink) =>
        new()
        {
            BeerDrinkId = drink.BeerDrinkId,
            Name = drink.Name,
            CratePriceCents = drink.CratePriceCents,
            IsDefault = drink.IsDefault,
            IsRetired = drink.IsRetired,
            Crates = drink.Crates,
            Forecast = new BeerStockForecastDto
            {
                PaceWindowDays = drink.Forecast.PaceWindowDays,
                CratesTakenInPaceWindow = drink.Forecast.CratesTakenInPaceWindow,
                ProjectedEmptyOn = drink.Forecast.ProjectedEmptyOn,
            },
        };

    private static BeerStockMovementSummaryDto ToDto(BeerStockMovementSummary movement) =>
        new()
        {
            MovementId = movement.MovementId,
            Kind = movement.Kind,
            BeerDrinkId = movement.BeerDrinkId,
            DrinkName = movement.DrinkName,
            Crates = movement.Crates,
            BookedAt = movement.BookedAt,
            BookedBy = movement.BookedBy is { } booker
                ? new BeerStockBookerDto
                {
                    PersonId = booker.PersonId,
                    FirstName = booker.FirstName,
                    LastName = booker.LastName,
                }
                : null,
        };
}

public sealed record GetBeerStockRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }
}

public sealed class GetBeerStockValidator : Validator<GetBeerStockRequest>
{
    public GetBeerStockValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
    }
}

public sealed record GetBeerStockResponse
{
    public required IReadOnlyList<BeerDrinkStockDto> Drinks { get; init; }

    public required IReadOnlyList<BeerStockMovementSummaryDto> Movements { get; init; }
}

public sealed record BeerDrinkStockDto
{
    public required int BeerDrinkId { get; init; }

    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }

    public required bool IsDefault { get; init; }

    public required bool IsRetired { get; init; }

    public required int Crates { get; init; }

    public required BeerStockForecastDto Forecast { get; init; }
}

public sealed record BeerStockForecastDto
{
    public required int PaceWindowDays { get; init; }

    public required int CratesTakenInPaceWindow { get; init; }

    public required DateOnly? ProjectedEmptyOn { get; init; }
}

public sealed record BeerStockMovementSummaryDto
{
    public required int MovementId { get; init; }

    public required BeerStockMovementKind Kind { get; init; }

    public required int BeerDrinkId { get; init; }

    public required string DrinkName { get; init; }

    public required int Crates { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerStockBookerDto? BookedBy { get; init; }
}

public sealed record BeerStockBookerDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
