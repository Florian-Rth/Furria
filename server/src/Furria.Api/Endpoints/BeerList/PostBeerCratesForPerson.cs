using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Core.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostBeerCratesForPerson
    : Endpoint<PostBeerCratesForPersonRequest, PostBeerCratesForPersonResponse>
{
    private readonly BeerTabService _beerTabService;

    public PostBeerCratesForPerson(BeerTabService beerTabService)
    {
        _beerTabService = beerTabService;
    }

    public override void Configure()
    {
        Post("beer-list/pots/{beerPotId}/crates");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(PostBeerCratesForPersonRequest req, CancellationToken ct)
    {
        var result = await _beerTabService.BookCratesForAsync(
            new BeerCratesForCommand
            {
                BeerPotId = req.BeerPotId,
                PersonId = req.PersonId,
                Count = req.Count,
                EnteredByPersonId = User.PersonId(),
            },
            ct
        );

        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostBeerCratesForPersonResponse
            {
                CrateIds = result.Value.CrateIds,
                UndoableUntil = result.Value.UndoableUntil,
            },
            cancellation: ct
        );
    }
}

public sealed record PostBeerCratesForPersonRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }

    public required int PersonId { get; init; }

    public required int Count { get; init; }
}

public sealed class PostBeerCratesForPersonValidator : Validator<PostBeerCratesForPersonRequest>
{
    private const string CountMessage = "Gebucht werden 1 bis 20 Kisten auf einmal.";

    public PostBeerCratesForPersonValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.Count)
            .InclusiveBetween(1, BeerCrate.MaxPerOperatorBooking)
            .WithMessage(CountMessage);
    }
}

public sealed record PostBeerCratesForPersonResponse
{
    public required IReadOnlyList<int> CrateIds { get; init; }

    public required DateTimeOffset UndoableUntil { get; init; }
}
