using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.MembershipApplications;

namespace Furria.Api.Endpoints.MembershipApplications;

public sealed class DeleteMembershipApplicationById
    : Endpoint<DeleteMembershipApplicationByIdRequest>
{
    private readonly MembershipApplicationService _membershipApplicationService;

    public DeleteMembershipApplicationById(
        MembershipApplicationService membershipApplicationService
    )
    {
        _membershipApplicationService = membershipApplicationService;
    }

    public override void Configure()
    {
        Delete("manage/membership-applications/{membershipApplicationId}");
        Definition.RequirePermission(FurriaPermissions.MembershipApplicationsDecide);
    }

    public override async Task HandleAsync(
        DeleteMembershipApplicationByIdRequest req,
        CancellationToken ct
    )
    {
        var result = await _membershipApplicationService.DeclineAsync(
            req.MembershipApplicationId,
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteMembershipApplicationByIdRequest
{
    [RouteParam]
    public required int MembershipApplicationId { get; init; }
}

public sealed class DeleteMembershipApplicationByIdValidator
    : Validator<DeleteMembershipApplicationByIdRequest>
{
    public DeleteMembershipApplicationByIdValidator()
    {
        RuleFor(request => request.MembershipApplicationId).GreaterThan(0);
    }
}
