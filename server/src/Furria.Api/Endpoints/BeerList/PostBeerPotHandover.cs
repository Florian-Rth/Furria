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
            SuccessorSettings = BeerPotSettingsRules.ToSettings(
                req.CratePriceCents,
                req.PaymentLink,
                req.PaymentNote
            ),
            HandedOverByPersonId = User.PersonId(),
        };
}

public sealed record PostBeerPotHandoverRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required int SuccessorPersonId { get; init; }

    public required int CratePriceCents { get; init; }

    public string? PaymentLink { get; init; }

    public string? PaymentNote { get; init; }
}

public sealed class PostBeerPotHandoverValidator : Validator<PostBeerPotHandoverRequest>
{
    public PostBeerPotHandoverValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.SuccessorPersonId).GreaterThan(0);
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

public sealed record PostBeerPotHandoverResponse
{
    public required int BeerPotId { get; init; }

    public required int CarriedCrates { get; init; }
}
