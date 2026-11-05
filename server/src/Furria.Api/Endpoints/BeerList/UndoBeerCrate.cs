using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class UndoBeerCrate : Endpoint<UndoBeerCrateRequest>
{
    private readonly BeerTabService _beerTabService;

    public UndoBeerCrate(BeerTabService beerTabService)
    {
        _beerTabService = beerTabService;
    }

    public override void Configure()
    {
        Post("beer-list/crates/{beerCrateId}/undo");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(UndoBeerCrateRequest req, CancellationToken ct)
    {
        var result = await _beerTabService.UndoCrateAsync(req.BeerCrateId, User.PersonId(), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record UndoBeerCrateRequest
{
    [RouteParam]
    public required int BeerCrateId { get; init; }
}

public sealed class UndoBeerCrateValidator : Validator<UndoBeerCrateRequest>
{
    public UndoBeerCrateValidator()
    {
        RuleFor(request => request.BeerCrateId).GreaterThan(0);
    }
}
