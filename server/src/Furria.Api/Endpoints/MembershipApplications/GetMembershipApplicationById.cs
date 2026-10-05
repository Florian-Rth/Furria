using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.MembershipApplications;
using Furria.Core.Club;
using Furria.Core.MembershipApplications;
using Furria.Infrastructure.MembershipApplications;

namespace Furria.Api.Endpoints.MembershipApplications;

public sealed class GetMembershipApplicationById
    : Endpoint<GetMembershipApplicationByIdRequest, GetMembershipApplicationByIdResponse>
{
    private readonly MembershipApplicationService _membershipApplicationService;

    public GetMembershipApplicationById(MembershipApplicationService membershipApplicationService)
    {
        _membershipApplicationService = membershipApplicationService;
    }

    public override void Configure()
    {
        Get("manage/membership-applications/{membershipApplicationId}");
        Definition.RequirePermission(FurriaPermissions.MembershipApplicationsDecide);
    }

    public override async Task HandleAsync(
        GetMembershipApplicationByIdRequest req,
        CancellationToken ct
    )
    {
        var application = await _membershipApplicationService.GetUndecidedAsync(
            req.MembershipApplicationId,
            ct
        );
        if (!application.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(application.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(application.Value), cancellation: ct);
    }

    private static GetMembershipApplicationByIdResponse ToResponse(
        MembershipApplicationDetails application
    ) =>
        new()
        {
            MembershipApplicationId = application.MembershipApplicationId,
            FirstName = application.FirstName,
            LastName = application.LastName,
            BirthDate = application.BirthDate,
            Age = application.Age,
            IsMinor = application.IsMinor,
            Street = application.Street,
            Zip = application.Zip,
            City = application.City,
            Email = application.Email,
            Phone = application.Phone,
            SubmittedAt = application.SubmittedAt,
            ConfirmedAt = application.ConfirmedAt,
            AppliedOn = application.AppliedOn,
            AgeOfConsent = application.AgeOfConsent,
            Candidates = [.. application.Candidates.Select(ToDto)],
        };

    private static AdmissionCandidateDto ToDto(AdmissionCandidate candidate) =>
        new()
        {
            PersonId = candidate.PersonId,
            FirstName = candidate.FirstName,
            LastName = candidate.LastName,
            BirthDate = candidate.BirthDate,
            Email = candidate.Email,
            City = candidate.City,
            MembershipState = candidate.MembershipState,
            MemberSince = candidate.MemberSince,
            IsMember = candidate.IsMember,
            Groups = candidate.Groups,
            Roles = candidate.Roles,
            HasAccount = candidate.HasAccount,
            IsAffiliated = candidate.IsAffiliated,
            Gaps = candidate.Gaps,
        };
}

public sealed record GetMembershipApplicationByIdRequest
{
    [RouteParam]
    public required int MembershipApplicationId { get; init; }
}

public sealed class GetMembershipApplicationByIdValidator
    : Validator<GetMembershipApplicationByIdRequest>
{
    public GetMembershipApplicationByIdValidator()
    {
        RuleFor(request => request.MembershipApplicationId).GreaterThan(0);
    }
}

public sealed record GetMembershipApplicationByIdResponse
{
    public required int MembershipApplicationId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }

    public required int Age { get; init; }

    public required bool IsMinor { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string Email { get; init; }

    public required string? Phone { get; init; }

    public required DateTimeOffset SubmittedAt { get; init; }

    public required DateTimeOffset ConfirmedAt { get; init; }

    public required DateOnly AppliedOn { get; init; }

    public required int AgeOfConsent { get; init; }

    public required IReadOnlyList<AdmissionCandidateDto> Candidates { get; init; }
}

public sealed record AdmissionCandidateDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required string? Email { get; init; }

    public required string? City { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required bool IsMember { get; init; }

    public required IReadOnlyList<string> Groups { get; init; }

    public required IReadOnlyList<string> Roles { get; init; }

    public required bool HasAccount { get; init; }

    public required bool IsAffiliated { get; init; }

    public required IReadOnlyList<RegistryGap> Gaps { get; init; }
}
