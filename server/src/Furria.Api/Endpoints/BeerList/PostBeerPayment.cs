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

    public required int Crates { get; init; }
}

public sealed class PostBeerPaymentValidator : Validator<PostBeerPaymentRequest>
{
    private static readonly string CratesMessage =
        $"Eine Zahlung begleicht 1 bis {BeerPayment.MaxCrates} ganze Kisten.";

    public PostBeerPaymentValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.Crates)
            .InclusiveBetween(1, BeerPayment.MaxCrates)
            .WithMessage(CratesMessage);
    }
}

public sealed record PostBeerPaymentResponse
{
    public required int BeerPaymentId { get; init; }

    public required int Crates { get; init; }

    public required int AmountCents { get; init; }
}
