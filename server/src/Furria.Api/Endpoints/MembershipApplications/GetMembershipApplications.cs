using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.MembershipApplications;
using Furria.Infrastructure.MembershipApplications;

namespace Furria.Api.Endpoints.MembershipApplications;

public sealed class GetMembershipApplications
    : EndpointWithoutRequest<GetMembershipApplicationsResponse>
{
    private readonly MembershipApplicationService _membershipApplicationService;

    public GetMembershipApplications(MembershipApplicationService membershipApplicationService)
    {
        _membershipApplicationService = membershipApplicationService;
    }

    public override void Configure()
    {
        Get("manage/membership-applications");
        Definition.RequirePermission(FurriaPermissions.MembershipApplicationsDecide);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var applications = await _membershipApplicationService.GetUndecidedAsync(ct);

        await Send.OkAsync(ToResponse(applications), cancellation: ct);
    }

    private static GetMembershipApplicationsResponse ToResponse(
        IReadOnlyList<MembershipApplicationSummary> applications
    ) => new() { Applications = [.. applications.Select(ToDto)] };

    private static MembershipApplicationSummaryDto ToDto(
        MembershipApplicationSummary application
    ) =>
        new()
        {
            MembershipApplicationId = application.MembershipApplicationId,
            FirstName = application.FirstName,
            LastName = application.LastName,
            Age = application.Age,
            IsMinor = application.IsMinor,
            City = application.City,
            ConfirmedAt = application.ConfirmedAt,
        };
}

public sealed record GetMembershipApplicationsResponse
{
    public required IReadOnlyList<MembershipApplicationSummaryDto> Applications { get; init; }
}

public sealed record MembershipApplicationSummaryDto
{
    public required int MembershipApplicationId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required int Age { get; init; }

    public required bool IsMinor { get; init; }

    public required string City { get; init; }

    public required DateTimeOffset ConfirmedAt { get; init; }
}
