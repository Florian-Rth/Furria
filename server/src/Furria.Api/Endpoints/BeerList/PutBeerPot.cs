using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PutBeerPot : Endpoint<PutBeerPotRequest>
{
    private readonly BeerListService _beerListService;

    public PutBeerPot(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Put("beer-list/pots/{beerPotId}");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PutBeerPotRequest req, CancellationToken ct)
    {
        var result = await _beerListService.UpdatePotSettingsAsync(
            req.BeerPotId,
            BeerPotSettingsRules.ToSettings(req.CratePriceCents, req.PaymentLink),
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

public sealed record PutBeerPotRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required int CratePriceCents { get; init; }

    public string? PaymentLink { get; init; }
}

public sealed class PutBeerPotValidator : Validator<PutBeerPotRequest>
{
    public PutBeerPotValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.CratePriceCents).CratePrice();
        RuleFor(request => request.PaymentLink).PaymentLink();
    }
}
