using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.BeerList;
using Furria.Core.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class UndoMyBeerCrates : Endpoint<UndoMyBeerCratesRequest>
{
    private readonly BeerTabService _beerTabService;

    public UndoMyBeerCrates(BeerTabService beerTabService)
    {
        _beerTabService = beerTabService;
    }

    public override void Configure()
    {
        Post("beer-list/crates/undo");
        Definition.RequireAnyPermission(BeerListKeys.Readers);
    }

    public override async Task HandleAsync(UndoMyBeerCratesRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _beerTabService.UndoOwnCratesAsync(personId.Value, req.CrateIds, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record UndoMyBeerCratesRequest
{
    public required IReadOnlyList<int> CrateIds { get; init; }
}

public sealed class UndoMyBeerCratesValidator : Validator<UndoMyBeerCratesRequest>
{
    private const string CrateIdsMessage = "Nimm 1 bis 20 verschiedene Kisten zurück.";

    public UndoMyBeerCratesValidator()
    {
        RuleFor(request => request.CrateIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .WithMessage(CrateIdsMessage)
            .Must(ids =>
                ids.Count is > 0 and <= BeerCrate.MaxPerOperatorBooking
                && ids.Distinct().Count() == ids.Count
            )
            .WithMessage(CrateIdsMessage);
        RuleForEach(request => request.CrateIds).GreaterThan(0);
    }
}
