using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetOpenBeerPot : EndpointWithoutRequest<GetOpenBeerPotResponse>
{
    private readonly BeerListService _beerListService;

    public GetOpenBeerPot(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Get("beer-list/pot");
        Definition.RequireAnyPermission(BeerListKeys.Readers);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var pot = await _beerListService.GetOpenPotAsync(ct);

        await Send.OkAsync(
            new GetOpenBeerPotResponse { Pot = pot is null ? null : ToDto(pot) },
            cancellation: ct
        );
    }

    private static OpenBeerPotDetailsDto ToDto(BeerPotDetails pot) =>
        new()
        {
            BeerPotId = pot.BeerPotId,
            Owner = pot.Owner is { } owner ? ToDto(owner) : null,
            PaymentLink = pot.PaymentLink,
            OpenedAt = pot.OpenedAt,
            Drinks = [.. pot.Drinks.Select(ToDto)],
        };

    private static OpenBeerPotDrinkDto ToDto(BeerPotDrinkSummary drink) =>
        new()
        {
            BeerDrinkId = drink.BeerDrinkId,
            Name = drink.Name,
            CratePriceCents = drink.CratePriceCents,
            HasStock = drink.HasStock,
            IsDefault = drink.IsDefault,
        };

    private static BeerPotOwnerDto ToDto(BeerListPerson owner) =>
        new()
        {
            PersonId = owner.PersonId,
            FirstName = owner.FirstName,
            LastName = owner.LastName,
        };
}

public sealed record GetOpenBeerPotResponse
{
    public required OpenBeerPotDetailsDto? Pot { get; init; }
}

public sealed record OpenBeerPotDetailsDto
{
    public required int BeerPotId { get; init; }

    public required BeerPotOwnerDto? Owner { get; init; }

    public required string? PaymentLink { get; init; }

    public required DateTimeOffset OpenedAt { get; init; }

    public required IReadOnlyList<OpenBeerPotDrinkDto> Drinks { get; init; }
}

public sealed record OpenBeerPotDrinkDto
{
    public required int BeerDrinkId { get; init; }

    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }

    public required bool HasStock { get; init; }

    public required bool IsDefault { get; init; }
}

public sealed record BeerPotOwnerDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
