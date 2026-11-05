using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class UndoBeerPayment : Endpoint<UndoBeerPaymentRequest>
{
    private readonly BeerPaymentService _beerPaymentService;

    public UndoBeerPayment(BeerPaymentService beerPaymentService)
    {
        _beerPaymentService = beerPaymentService;
    }

    public override void Configure()
    {
        Post("beer-list/payments/{beerPaymentId}/undo");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(UndoBeerPaymentRequest req, CancellationToken ct)
    {
        var result = await _beerPaymentService.UndoAsync(req.BeerPaymentId, User.PersonId(), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record UndoBeerPaymentRequest
{
    [RouteParam]
    public required int BeerPaymentId { get; init; }
}

public sealed class UndoBeerPaymentValidator : Validator<UndoBeerPaymentRequest>
{
    public UndoBeerPaymentValidator()
    {
        RuleFor(request => request.BeerPaymentId).GreaterThan(0);
    }
}
