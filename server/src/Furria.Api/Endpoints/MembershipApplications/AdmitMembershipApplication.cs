using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.MembershipApplications;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.MembershipApplications;

namespace Furria.Api.Endpoints.MembershipApplications;

public sealed class AdmitMembershipApplication
    : Endpoint<AdmitMembershipApplicationRequest, AdmitMembershipApplicationResponse>
{
    private readonly MembershipApplicationService _membershipApplicationService;

    public AdmitMembershipApplication(MembershipApplicationService membershipApplicationService)
    {
        _membershipApplicationService = membershipApplicationService;
    }

    public override void Configure()
    {
        Post("manage/membership-applications/{membershipApplicationId}/admission");
        Definition.RequirePermission(FurriaPermissions.MembershipApplicationsDecide);
    }

    public override async Task HandleAsync(
        AdmitMembershipApplicationRequest req,
        CancellationToken ct
    )
    {
        var admission = await _membershipApplicationService.AdmitAsync(
            ToCommand(req, User.PersonId()),
            ct
        );
        if (!admission.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(admission.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(admission.Value), cancellation: ct);
    }

    private static AdmitMembershipApplicationCommand ToCommand(
        AdmitMembershipApplicationRequest req,
        int? admitterPersonId
    ) =>
        new()
        {
            MembershipApplicationId = req.MembershipApplicationId,
            PersonId = req.PersonId,
            AdmittedOn = req.AdmittedOn,
            GuardianConsentConfirmed = req.GuardianConsentConfirmed,
            AdmitterPersonId = admitterPersonId,
        };

    private static AdmitMembershipApplicationResponse ToResponse(AdmissionDetails admission) =>
        new()
        {
            PersonId = admission.PersonId,
            MembershipId = admission.MembershipId,
            Invitation = admission.Invitation,
        };
}

public sealed record AdmitMembershipApplicationRequest
{
    [RouteParam]
    public required int MembershipApplicationId { get; init; }

    public required int? PersonId { get; init; }

    public required DateOnly AdmittedOn { get; init; }

    public required bool GuardianConsentConfirmed { get; init; }
}

public sealed class AdmitMembershipApplicationValidator
    : Validator<AdmitMembershipApplicationRequest>
{
    public AdmitMembershipApplicationValidator()
    {
        RuleFor(request => request.MembershipApplicationId).GreaterThan(0);
        RuleFor(request => request.PersonId)
            .GreaterThan(0)
            .When(request => request.PersonId is not null);
        RuleFor(request => request.AdmittedOn).NotEmpty();
    }
}

public sealed record AdmitMembershipApplicationResponse
{
    public required int PersonId { get; init; }

    public required int MembershipId { get; init; }

    public required AdmissionInvitation Invitation { get; init; }
}
