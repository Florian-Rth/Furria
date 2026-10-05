using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Application.MembershipApplications;
using Furria.Infrastructure.MembershipApplications;

namespace Furria.Api.Endpoints.MembershipApplications;

public sealed class ConfirmMembershipApplication
    : Endpoint<ConfirmMembershipApplicationRequest, ConfirmMembershipApplicationResponse>
{
    private readonly MembershipApplicationService _membershipApplicationService;

    public ConfirmMembershipApplication(MembershipApplicationService membershipApplicationService)
    {
        _membershipApplicationService = membershipApplicationService;
    }

    public override void Configure()
    {
        Post("membership-applications/confirmation");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(
        ConfirmMembershipApplicationRequest req,
        CancellationToken ct
    )
    {
        var outcome = await _membershipApplicationService.ConfirmAsync(req.Token, ct);
        if (outcome == MembershipApplicationConfirmation.Expired)
        {
            await Send.StatusCodeAsync(StatusCodes.Status410Gone, ct);
            return;
        }

        await Send.OkAsync(
            new ConfirmMembershipApplicationResponse { Outcome = outcome },
            cancellation: ct
        );
    }
}

public sealed record ConfirmMembershipApplicationRequest
{
    public required string Token { get; init; }
}

public sealed class ConfirmMembershipApplicationValidator
    : Validator<ConfirmMembershipApplicationRequest>
{
    private const int TokenLength = 128;

    public ConfirmMembershipApplicationValidator()
    {
        RuleFor(request => request.Token).NotEmpty().MaximumLength(TokenLength);
    }
}

public sealed record ConfirmMembershipApplicationResponse
{
    public required MembershipApplicationConfirmation Outcome { get; init; }
}
