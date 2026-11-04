using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Core.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostBeerDelivery : Endpoint<PostBeerDeliveryRequest>
{
    private readonly BeerStockService _beerStockService;

    public PostBeerDelivery(BeerStockService beerStockService)
    {
        _beerStockService = beerStockService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/deliveries");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PostBeerDeliveryRequest req, CancellationToken ct)
    {
        var result = await _beerStockService.BookDeliveryAsync(
            new BeerDeliveryCommand
            {
                BeerPotId = req.BeerPotId,
                Crates = req.Crates,
                BookedByPersonId = User.PersonId(),
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

public sealed record PostBeerDeliveryRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required int Crates { get; init; }
}

public sealed class PostBeerDeliveryValidator : Validator<PostBeerDeliveryRequest>
{
    private const string CratesMessage = "Eine Lieferung bringt 1 bis 500 Kisten.";

    public PostBeerDeliveryValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.Crates)
            .InclusiveBetween(1, BeerStockMovement.MaxCrates)
            .WithMessage(CratesMessage);
    }
}
