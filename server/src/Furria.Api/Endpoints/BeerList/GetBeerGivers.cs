using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetBeerGivers : EndpointWithoutRequest<GetBeerGiversResponse>
{
    private readonly BeerTabService _beerTabService;

    public GetBeerGivers(BeerTabService beerTabService)
    {
        _beerTabService = beerTabService;
    }

    public override void Configure()
    {
        Get("beer-list/givers");
        Definition.RequireAnyPermission(BeerListKeys.Readers);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var givers = await _beerTabService.GetGiversAsync(ct);

        await Send.OkAsync(
            new GetBeerGiversResponse { Givers = [.. givers.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static BeerGiverSummaryDto ToDto(BeerGiverSummary giver) =>
        new()
        {
            PersonId = giver.PersonId,
            FirstName = giver.FirstName,
            LastName = giver.LastName,
            Crates = giver.Crates,
        };
}

public sealed record GetBeerGiversResponse
{
    public required IReadOnlyList<BeerGiverSummaryDto> Givers { get; init; }
}

public sealed record BeerGiverSummaryDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required int Crates { get; init; }
}
