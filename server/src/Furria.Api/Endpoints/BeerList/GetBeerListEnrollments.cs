using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetBeerListEnrollments : EndpointWithoutRequest<GetBeerListEnrollmentsResponse>
{
    private readonly BeerListService _beerListService;

    public GetBeerListEnrollments(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Get("beer-list/enrollments");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var enrollments = await _beerListService.GetEnrollmentsAsync(ct);

        await Send.OkAsync(
            new GetBeerListEnrollmentsResponse { Enrollments = [.. enrollments.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static BeerListEnrollmentSummaryDto ToDto(BeerListEnrollmentSummary enrollment) =>
        new()
        {
            EnrollmentId = enrollment.EnrollmentId,
            PersonId = enrollment.PersonId,
            FirstName = enrollment.FirstName,
            LastName = enrollment.LastName,
            StartedAt = enrollment.StartedAt,
            EndedAt = enrollment.EndedAt,
            EndedBy = enrollment.EndedBy is { } ender ? ToDto(ender) : null,
        };

    private static BeerListEnrollmentEnderDto ToDto(BeerListPerson ender) =>
        new()
        {
            PersonId = ender.PersonId,
            FirstName = ender.FirstName,
            LastName = ender.LastName,
        };
}

public sealed record GetBeerListEnrollmentsResponse
{
    public required IReadOnlyList<BeerListEnrollmentSummaryDto> Enrollments { get; init; }
}

public sealed record BeerListEnrollmentSummaryDto
{
    public required int EnrollmentId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset? EndedAt { get; init; }

    public required BeerListEnrollmentEnderDto? EndedBy { get; init; }
}

public sealed record BeerListEnrollmentEnderDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
