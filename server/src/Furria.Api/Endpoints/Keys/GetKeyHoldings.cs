using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Keys;

public sealed class GetKeyHoldings : EndpointWithoutRequest<GetKeyHoldingsResponse>
{
    private readonly KeyHoldingService _keyHoldingService;

    public GetKeyHoldings(KeyHoldingService keyHoldingService)
    {
        _keyHoldingService = keyHoldingService;
    }

    public override void Configure()
    {
        Get("manage/keys");
        Definition.RequirePermission(FurriaPermissions.KeyHoldingsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var venues = await _keyHoldingService.GetVenuesWithHoldingsAsync(ct);

        await Send.OkAsync(ToResponse(venues), cancellation: ct);
    }

    private static GetKeyHoldingsResponse ToResponse(
        IReadOnlyList<KeyHoldingVenueSummary> venues
    ) => new() { Venues = [.. venues.Select(ToDto)] };

    private static KeyVenueDto ToDto(KeyHoldingVenueSummary venue) =>
        new()
        {
            VenueId = venue.VenueId,
            Name = venue.Name,
            ArchivedOn = venue.ArchivedOn,
            Holdings = [.. venue.Holdings.Select(ToDto)],
        };

    private static KeyHoldingSummaryDto ToDto(KeyHoldingSummary holding) =>
        new()
        {
            KeyHoldingId = holding.KeyHoldingId,
            PersonId = holding.PersonId,
            FirstName = holding.FirstName,
            LastName = holding.LastName,
            SinceOn = holding.SinceOn,
            UntilOn = holding.UntilOn,
        };
}

public sealed record GetKeyHoldingsResponse
{
    public required IReadOnlyList<KeyVenueDto> Venues { get; init; }
}

public sealed record KeyVenueDto
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<KeyHoldingSummaryDto> Holdings { get; init; }
}

public sealed record KeyHoldingSummaryDto
{
    public required int KeyHoldingId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
