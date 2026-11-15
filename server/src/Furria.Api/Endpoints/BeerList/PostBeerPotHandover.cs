using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostBeerPotHandover
    : Endpoint<PostBeerPotHandoverRequest, PostBeerPotHandoverResponse>
{
    private readonly BeerListService _beerListService;

    public PostBeerPotHandover(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/handover");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PostBeerPotHandoverRequest req, CancellationToken ct)
    {
        var result = await _beerListService.HandOverAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostBeerPotHandoverResponse
            {
                BeerPotId = result.Value.SuccessorBeerPotId,
                CarriedCrates = result.Value.CarriedCrates,
            },
            cancellation: ct
        );
    }

    private BeerPotHandoverCommand ToCommand(PostBeerPotHandoverRequest req) =>
        new()
        {
            BeerPotId = req.BeerPotId,
            SuccessorPersonId = req.SuccessorPersonId,
            SuccessorPaymentLink = BeerPotSettingsRules.ToPaymentLink(req.PaymentLink),
            CarriedDrinkPrices =
            [
                .. req.Drinks.Select(drink => new BeerDrinkPrice
                {
                    BeerDrinkId = drink.BeerDrinkId,
                    CratePriceCents = drink.CratePriceCents,
                }),
            ],
            HandedOverByPersonId = User.PersonId(),
        };
}

public sealed record PostBeerPotHandoverRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required int SuccessorPersonId { get; init; }

    public string? PaymentLink { get; init; }

    public required IReadOnlyList<HandoverBeerDrinkDataDto> Drinks { get; init; }
}

public sealed record HandoverBeerDrinkDataDto
{
    public required int BeerDrinkId { get; init; }

    public required int CratePriceCents { get; init; }
}

public sealed class PostBeerPotHandoverValidator : Validator<PostBeerPotHandoverRequest>
{
    private const string DrinkTwiceMessage = "Jedes Getränk bekommt genau einen Preis.";

    public PostBeerPotHandoverValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.SuccessorPersonId).GreaterThan(0);
        RuleFor(request => request.PaymentLink).PaymentLink();
        RuleFor(request => request.Drinks).NotNull();
        RuleForEach(request => request.Drinks)
            .NotNull()
            .SetValidator(new HandoverBeerDrinkDataValidator());
        RuleFor(request => request.Drinks)
            .Must(EachDrinkOnce)
            .When(request => request.Drinks is not null && request.Drinks.All(IsGiven))
            .WithMessage(DrinkTwiceMessage);
    }

    [Pure]
    private static bool IsGiven(HandoverBeerDrinkDataDto? drink) => drink is not null;

    [Pure]
    private static bool EachDrinkOnce(IReadOnlyList<HandoverBeerDrinkDataDto> drinks) =>
        drinks.Select(drink => drink.BeerDrinkId).Distinct().Count() == drinks.Count;
}

public sealed class HandoverBeerDrinkDataValidator : Validator<HandoverBeerDrinkDataDto>
{
    public HandoverBeerDrinkDataValidator()
    {
        RuleFor(drink => drink.BeerDrinkId).GreaterThan(0);
        RuleFor(drink => drink.CratePriceCents).CratePrice();
    }
}

public sealed record PostBeerPotHandoverResponse
{
    public required int BeerPotId { get; init; }

    public required int CarriedCrates { get; init; }
}
