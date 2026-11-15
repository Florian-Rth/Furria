using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostBeerPotDrink : Endpoint<PostBeerPotDrinkRequest, PostBeerPotDrinkResponse>
{
    private readonly BeerDrinkService _beerDrinkService;

    public PostBeerPotDrink(BeerDrinkService beerDrinkService)
    {
        _beerDrinkService = beerDrinkService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/drinks");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PostBeerPotDrinkRequest req, CancellationToken ct)
    {
        var result = await _beerDrinkService.ListDrinkAsync(
            new BeerDrinkCommand
            {
                BeerPotId = req.BeerPotId,
                Settings = BeerPotSettingsRules.ToDrinkSettings(req.Name, req.CratePriceCents),
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostBeerPotDrinkResponse { BeerDrinkId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostBeerPotDrinkRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }
}

public sealed class PostBeerPotDrinkValidator : Validator<PostBeerPotDrinkRequest>
{
    public PostBeerPotDrinkValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.Name).DrinkName();
        RuleFor(request => request.CratePriceCents).CratePrice();
    }
}

public sealed record PostBeerPotDrinkResponse
{
    public required int BeerDrinkId { get; init; }
}
