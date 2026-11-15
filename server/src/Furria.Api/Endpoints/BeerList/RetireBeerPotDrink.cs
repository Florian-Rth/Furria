using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class RetireBeerPotDrink : Endpoint<RetireBeerPotDrinkRequest>
{
    private readonly BeerDrinkService _beerDrinkService;

    public RetireBeerPotDrink(BeerDrinkService beerDrinkService)
    {
        _beerDrinkService = beerDrinkService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/drinks/{beerDrinkId}/retire");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(RetireBeerPotDrinkRequest req, CancellationToken ct)
    {
        var result = await _beerDrinkService.RetireDrinkAsync(req.BeerPotId, req.BeerDrinkId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RetireBeerPotDrinkRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    [RouteParam]
    public required int BeerDrinkId { get; init; }
}

public sealed class RetireBeerPotDrinkValidator : Validator<RetireBeerPotDrinkRequest>
{
    public RetireBeerPotDrinkValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.BeerDrinkId).GreaterThan(0);
    }
}
