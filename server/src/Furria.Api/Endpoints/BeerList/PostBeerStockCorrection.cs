using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Core.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostBeerStockCorrection : Endpoint<PostBeerStockCorrectionRequest>
{
    private readonly BeerStockService _beerStockService;

    public PostBeerStockCorrection(BeerStockService beerStockService)
    {
        _beerStockService = beerStockService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/stock-corrections");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PostBeerStockCorrectionRequest req, CancellationToken ct)
    {
        var result = await _beerStockService.BookCorrectionAsync(
            new BeerStockCorrectionCommand
            {
                BeerPotId = req.BeerPotId,
                Crates = req.Crates,
                Reason = req.Reason,
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

public sealed record PostBeerStockCorrectionRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required int Crates { get; init; }

    public required BeerStockCorrectionReason Reason { get; init; }
}

public sealed class PostBeerStockCorrectionValidator : Validator<PostBeerStockCorrectionRequest>
{
    private const string CratesMessage = "Eine Korrektur ändert den Bestand um 1 bis 500 Kisten.";
    private const string LossOnlyMessage = "Schwund und Bruch senken den Bestand nur.";

    public PostBeerStockCorrectionValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.Reason).IsInEnum();
        RuleFor(request => request.Crates)
            .NotEqual(0)
            .InclusiveBetween(-BeerStockMovement.MaxCrates, BeerStockMovement.MaxCrates)
            .WithMessage(CratesMessage);
        RuleFor(request => request.Crates)
            .Must((request, crates) => request.Reason.Fits(crates))
            .When(request => request.Crates != 0)
            .WithMessage(LossOnlyMessage);
    }
}
