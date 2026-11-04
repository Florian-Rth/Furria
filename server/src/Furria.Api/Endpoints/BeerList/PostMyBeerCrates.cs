using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostMyBeerCrates : Endpoint<PostMyBeerCratesRequest, PostMyBeerCratesResponse>
{
    private readonly BeerTabService _beerTabService;

    public PostMyBeerCrates(BeerTabService beerTabService)
    {
        _beerTabService = beerTabService;
    }

    public override void Configure()
    {
        Post("beer-list/crates");
        Definition.RequirePermission(FurriaPermissions.BeerListTake);
    }

    public override async Task HandleAsync(PostMyBeerCratesRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _beerTabService.BookOwnCratesAsync(personId.Value, req.Count, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostMyBeerCratesResponse
            {
                CrateIds = result.Value.CrateIds,
                UndoableUntil = result.Value.UndoableUntil,
            },
            cancellation: ct
        );
    }
}

public sealed record PostMyBeerCratesRequest
{
    public required int Count { get; init; }
}

public sealed class PostMyBeerCratesValidator : Validator<PostMyBeerCratesRequest>
{
    private static readonly string CountMessage =
        $"Du buchst 1 bis {BeerCrate.MaxPerOwnBooking} Kisten auf einmal.";

    public PostMyBeerCratesValidator()
    {
        RuleFor(request => request.Count)
            .InclusiveBetween(1, BeerCrate.MaxPerOwnBooking)
            .WithMessage(CountMessage);
    }
}

public sealed record PostMyBeerCratesResponse
{
    public required IReadOnlyList<int> CrateIds { get; init; }

    public required DateTimeOffset UndoableUntil { get; init; }
}
