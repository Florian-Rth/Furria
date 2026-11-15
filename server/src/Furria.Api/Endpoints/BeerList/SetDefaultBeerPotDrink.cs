using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class SetDefaultBeerPotDrink : Endpoint<SetDefaultBeerPotDrinkRequest>
{
    private readonly BeerDrinkService _beerDrinkService;

    public SetDefaultBeerPotDrink(BeerDrinkService beerDrinkService)
    {
        _beerDrinkService = beerDrinkService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/drinks/{beerDrinkId}/default");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(SetDefaultBeerPotDrinkRequest req, CancellationToken ct)
    {
        var result = await _beerDrinkService.MakeDefaultAsync(req.BeerPotId, req.BeerDrinkId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record SetDefaultBeerPotDrinkRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    [RouteParam]
    public required int BeerDrinkId { get; init; }
}

public sealed class SetDefaultBeerPotDrinkValidator : Validator<SetDefaultBeerPotDrinkRequest>
{
    public SetDefaultBeerPotDrinkValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.BeerDrinkId).GreaterThan(0);
    }
}
