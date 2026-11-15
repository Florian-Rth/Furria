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

public sealed class PostBeerPayment : Endpoint<PostBeerPaymentRequest, PostBeerPaymentResponse>
{
    private readonly BeerPaymentService _beerPaymentService;

    public PostBeerPayment(BeerPaymentService beerPaymentService)
    {
        _beerPaymentService = beerPaymentService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/payments");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PostBeerPaymentRequest req, CancellationToken ct)
    {
        var result = await _beerPaymentService.PayAsync(
            new BeerPaymentCommand
            {
                BeerPotId = req.BeerPotId,
                PersonId = req.PersonId,
                Drinks =
                [
                    .. req.Drinks.Select(drink => new BeerDrinkCrates
                    {
                        BeerDrinkId = drink.BeerDrinkId,
                        Crates = drink.Crates,
                    }),
                ],
                BookedByPersonId = User.PersonId(),
            },
            ct
        );

        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostBeerPaymentResponse
            {
                BeerPaymentId = result.Value.BeerPaymentId,
                Crates = result.Value.Crates,
                AmountCents = result.Value.AmountCents,
            },
            cancellation: ct
        );
    }
}

public sealed record PostBeerPaymentRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required int PersonId { get; init; }

    public required IReadOnlyList<PaidBeerDrinkDataDto> Drinks { get; init; }
}

public sealed record PaidBeerDrinkDataDto
{
    public required int BeerDrinkId { get; init; }

    public required int Crates { get; init; }
}

public sealed class PostBeerPaymentValidator : Validator<PostBeerPaymentRequest>
{
    private const string DrinkTwiceMessage = "Jedes Getränk steht nur einmal in einer Zahlung.";
    private static readonly string CratesMessage =
        $"Eine Zahlung begleicht 1 bis {BeerPayment.MaxCrates} ganze Kisten.";

    public PostBeerPaymentValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.Drinks).NotEmpty().WithMessage(CratesMessage);
        RuleForEach(request => request.Drinks)
            .NotNull()
            .SetValidator(new PaidBeerDrinkDataValidator());
        RuleFor(request => request.Drinks)
            .Must(EachDrinkOnce)
            .When(AllDrinksGiven)
            .WithMessage(DrinkTwiceMessage);
        RuleFor(request => request.Drinks)
            .Must(StayWithinMaxCrates)
            .When(AllDrinksGiven)
            .WithMessage(CratesMessage);
    }

    [Pure]
    private static bool AllDrinksGiven(PostBeerPaymentRequest request) =>
        request.Drinks is not null && request.Drinks.All(drink => drink is not null);

    [Pure]
    private static bool EachDrinkOnce(IReadOnlyList<PaidBeerDrinkDataDto> drinks) =>
        drinks.Select(drink => drink.BeerDrinkId).Distinct().Count() == drinks.Count;

    [Pure]
    private static bool StayWithinMaxCrates(IReadOnlyList<PaidBeerDrinkDataDto> drinks) =>
        drinks.Sum(drink => (long)drink.Crates) <= BeerPayment.MaxCrates;
}

public sealed class PaidBeerDrinkDataValidator : Validator<PaidBeerDrinkDataDto>
{
    private const string CratesMessage = "Je Getränk wird mindestens 1 ganze Kiste bezahlt.";

    public PaidBeerDrinkDataValidator()
    {
        RuleFor(drink => drink.BeerDrinkId).GreaterThan(0);
        RuleFor(drink => drink.Crates).GreaterThanOrEqualTo(1).WithMessage(CratesMessage);
    }
}

public sealed record PostBeerPaymentResponse
{
    public required int BeerPaymentId { get; init; }

    public required int Crates { get; init; }

    public required int AmountCents { get; init; }
}
