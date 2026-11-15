using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Core.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostBeerPot : Endpoint<PostBeerPotRequest, PostBeerPotResponse>
{
    private readonly BeerListService _beerListService;

    public PostBeerPot(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Post("beer-list/pots");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PostBeerPotRequest req, CancellationToken ct)
    {
        var result = await _beerListService.OpenPotAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostBeerPotResponse { BeerPotId = result.Value }, cancellation: ct);
    }

    private static BeerPotOpenCommand ToCommand(PostBeerPotRequest req) =>
        new()
        {
            OwnerPersonId = req.OwnerPersonId,
            PaymentLink = BeerPotSettingsRules.ToPaymentLink(req.PaymentLink),
            Drinks =
            [
                .. req.Drinks.Select(drink =>
                    BeerPotSettingsRules.ToDrinkSettings(drink.Name, drink.CratePriceCents)
                ),
            ],
        };
}

public sealed record PostBeerPotRequest
{
    public required int OwnerPersonId { get; init; }

    public string? PaymentLink { get; init; }

    public required IReadOnlyList<OpenBeerPotDrinkDataDto> Drinks { get; init; }
}

public sealed record OpenBeerPotDrinkDataDto
{
    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }
}

public sealed class PostBeerPotValidator : Validator<PostBeerPotRequest>
{
    private static readonly string DrinkCountMessage =
        $"Eine Bierliste führt 1 bis {BeerPot.MaxDrinks} Getränke.";
    private const string DrinkTwiceMessage = "Jedes Getränk steht nur einmal auf der Bierliste.";

    public PostBeerPotValidator()
    {
        RuleFor(request => request.OwnerPersonId).GreaterThan(0);
        RuleFor(request => request.PaymentLink).PaymentLink();
        RuleFor(request => request.Drinks).NotNull();
        RuleFor(request => request.Drinks.Count)
            .InclusiveBetween(1, BeerPot.MaxDrinks)
            .When(request => request.Drinks is not null)
            .WithMessage(DrinkCountMessage);
        RuleForEach(request => request.Drinks)
            .NotNull()
            .SetValidator(new OpenBeerPotDrinkDataValidator());
        RuleFor(request => request.Drinks)
            .Must(EachNameOnce)
            .When(request => request.Drinks is not null && request.Drinks.All(HasName))
            .WithMessage(DrinkTwiceMessage);
    }

    [Pure]
    private static bool HasName(OpenBeerPotDrinkDataDto? drink) =>
        drink is not null && !string.IsNullOrWhiteSpace(drink.Name);

    [Pure]
    private static bool EachNameOnce(IReadOnlyList<OpenBeerPotDrinkDataDto> drinks) =>
        drinks.Select(drink => BeerPotSettingsRules.NameKey(drink.Name)).Distinct().Count()
        == drinks.Count;
}

public sealed class OpenBeerPotDrinkDataValidator : Validator<OpenBeerPotDrinkDataDto>
{
    public OpenBeerPotDrinkDataValidator()
    {
        RuleFor(drink => drink.Name).DrinkName();
        RuleFor(drink => drink.CratePriceCents).CratePrice();
    }
}

public sealed record PostBeerPotResponse
{
    public required int BeerPotId { get; init; }
}
