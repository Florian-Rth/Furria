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
            CratePriceCents = pot.CratePriceCents,
            PaymentLink = pot.PaymentLink,
            PaymentNote = pot.PaymentNote,
            OpenedAt = pot.OpenedAt,
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

    public required int CratePriceCents { get; init; }

    public required string? PaymentLink { get; init; }

    public required string? PaymentNote { get; init; }

    public required DateTimeOffset OpenedAt { get; init; }
}

public sealed record BeerPotOwnerDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
