using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Halls;
using Furria.Core.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Seating;

public sealed class GetSeating : EndpointWithoutRequest<GetSeatingResponse>
{
    private readonly SeatingService _seatingService;

    public GetSeating(SeatingService seatingService)
    {
        _seatingService = seatingService;
    }

    public override void Configure()
    {
        Get("seating");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var seating = await _seatingService.GetSeatingAsync(ct);

        await Send.OkAsync(
            new GetSeatingResponse
            {
                Standard = SeatingStandardDto.From(seating.Standard),
                TableTypes = [.. seating.TableTypes.Select(ToDto)],
            },
            cancellation: ct
        );
    }

    private static TableTypeSummaryDto ToDto(TableTypeSummary tableType) =>
        new()
        {
            TableTypeId = tableType.TableTypeId,
            Name = tableType.Name,
            Shape = tableType.Shape,
            LengthCm = tableType.LengthCm,
            WidthCm = tableType.WidthCm,
            SeatsAtEnds = tableType.SeatsAtEnds,
            Archived = tableType.IsArchived,
        };
}

public sealed record GetSeatingResponse
{
    public required SeatingStandardDto Standard { get; init; }

    public required IReadOnlyList<TableTypeSummaryDto> TableTypes { get; init; }
}

public sealed record TableTypeSummaryDto
{
    public required int TableTypeId { get; init; }

    public required string Name { get; init; }

    public required TableShape Shape { get; init; }

    public required int LengthCm { get; init; }

    public required int WidthCm { get; init; }

    public required bool SeatsAtEnds { get; init; }

    public required bool Archived { get; init; }
}
