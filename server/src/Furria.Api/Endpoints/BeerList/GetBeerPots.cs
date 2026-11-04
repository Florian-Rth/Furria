using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetBeerPots : EndpointWithoutRequest<GetBeerPotsResponse>
{
    private readonly BeerListService _beerListService;

    public GetBeerPots(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Get("beer-list/pots");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var pots = await _beerListService.GetPotsAsync(ct);
        await Send.OkAsync(
            new GetBeerPotsResponse { Pots = [.. pots.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static BeerPotSummaryDto ToDto(BeerPotSummary pot) =>
        new()
        {
            BeerPotId = pot.BeerPotId,
            Owner = pot.Owner is { } owner
                ? new BeerPotSummaryOwnerDto
                {
                    PersonId = owner.PersonId,
                    FirstName = owner.FirstName,
                    LastName = owner.LastName,
                }
                : null,
            CratePriceCents = pot.CratePriceCents,
            OpenedAt = pot.OpenedAt,
            ClosedAt = pot.ClosedAt,
            OpenTabs = pot.OpenTabs,
            OpenCrates = pot.OpenCrates,
            OpenCents = pot.OpenCents,
        };
}

public sealed record GetBeerPotsResponse
{
    public required IReadOnlyList<BeerPotSummaryDto> Pots { get; init; }
}

public sealed record BeerPotSummaryDto
{
    public required int BeerPotId { get; init; }

    public required BeerPotSummaryOwnerDto? Owner { get; init; }

    public required int CratePriceCents { get; init; }

    public required DateTimeOffset OpenedAt { get; init; }

    public required DateTimeOffset? ClosedAt { get; init; }

    public required int OpenTabs { get; init; }

    public required int OpenCrates { get; init; }

    public required int OpenCents { get; init; }
}

public sealed record BeerPotSummaryOwnerDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
