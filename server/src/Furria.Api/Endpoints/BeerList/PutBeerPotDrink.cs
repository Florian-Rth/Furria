using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PutBeerPotDrink : Endpoint<PutBeerPotDrinkRequest>
{
    private readonly BeerDrinkService _beerDrinkService;

    public PutBeerPotDrink(BeerDrinkService beerDrinkService)
    {
        _beerDrinkService = beerDrinkService;
    }

    public override void Configure()
    {
        Put("beer-list/pots/{beerPotId}/drinks/{beerDrinkId}");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PutBeerPotDrinkRequest req, CancellationToken ct)
    {
        var result = await _beerDrinkService.UpdateDrinkAsync(
            new BeerDrinkUpdateCommand
            {
                BeerPotId = req.BeerPotId,
                BeerDrinkId = req.BeerDrinkId,
                Settings = BeerPotSettingsRules.ToDrinkSettings(req.Name, req.CratePriceCents),
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

public sealed record PutBeerPotDrinkRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    [RouteParam]
    public required int BeerDrinkId { get; init; }

    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }
}

public sealed class PutBeerPotDrinkValidator : Validator<PutBeerPotDrinkRequest>
{
    public PutBeerPotDrinkValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.BeerDrinkId).GreaterThan(0);
        RuleFor(request => request.Name).DrinkName();
        RuleFor(request => request.CratePriceCents).CratePrice();
    }
}
