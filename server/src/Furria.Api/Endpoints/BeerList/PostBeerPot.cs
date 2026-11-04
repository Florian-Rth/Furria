using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
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
            Settings = BeerPotSettingsRules.ToSettings(
                req.CratePriceCents,
                req.PaymentLink,
                req.PaymentNote
            ),
        };
}

public sealed record PostBeerPotRequest
{
    public required int OwnerPersonId { get; init; }

    public required int CratePriceCents { get; init; }

    public string? PaymentLink { get; init; }

    public string? PaymentNote { get; init; }
}

public sealed class PostBeerPotValidator : Validator<PostBeerPotRequest>
{
    public PostBeerPotValidator()
    {
        RuleFor(request => request.OwnerPersonId).GreaterThan(0);
        RuleFor(request => request.CratePriceCents).CratePrice();
        RuleFor(request => request.PaymentLink).PaymentLink();
        RuleFor(request => request.PaymentNote).PaymentNote();
        RuleFor(request => request)
            .Must(request =>
                BeerPotSettingsRules.NamesPaymentDetails(request.PaymentLink, request.PaymentNote)
            )
            .OverridePropertyName(BeerPotSettingsRules.PaymentDetailsField)
            .WithMessage(BeerPotSettingsRules.MissingPaymentDetailsMessage);
    }
}

public sealed record PostBeerPotResponse
{
    public required int BeerPotId { get; init; }
}
