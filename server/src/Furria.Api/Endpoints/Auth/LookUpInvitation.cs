using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class LookUpInvitation : Endpoint<LookUpInvitationRequest, LookUpInvitationResponse>
{
    private static readonly LookUpInvitationResponse Dead = new()
    {
        Status = InvitationLookupStatus.Dead,
        FirstName = null,
        LoginEmail = null,
    };

    private readonly AccountAccessService _accountAccessService;
    private readonly InvitationTokenRateLimiter _tokenRateLimiter;

    public LookUpInvitation(
        AccountAccessService accountAccessService,
        InvitationTokenRateLimiter tokenRateLimiter
    )
    {
        _accountAccessService = accountAccessService;
        _tokenRateLimiter = tokenRateLimiter;
    }

    public override void Configure()
    {
        Post("auth/invitations/lookup");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(LookUpInvitationRequest req, CancellationToken ct)
    {
        if (!_tokenRateLimiter.TryAcquire(req.Token))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var invitation = await _accountAccessService.LookUpAsync(req.Token, ct);

        await Send.OkAsync(invitation is null ? Dead : ToResponse(invitation), cancellation: ct);
    }

    private static LookUpInvitationResponse ToResponse(InvitationLookupDetails invitation) =>
        new()
        {
            Status = InvitationLookupStatus.Live,
            FirstName = invitation.FirstName,
            LoginEmail = invitation.LoginEmail,
        };
}

public sealed record LookUpInvitationRequest
{
    public required string Token { get; init; }
}

public sealed class LookUpInvitationValidator : Validator<LookUpInvitationRequest>
{
    public LookUpInvitationValidator()
    {
        RuleFor(request => request.Token).NotEmpty().MaximumLength(InvitationTokenLimits.Length);
    }
}

public enum InvitationLookupStatus
{
    Live = 1,
    Dead = 2,
}

public sealed record LookUpInvitationResponse
{
    public required InvitationLookupStatus Status { get; init; }

    public required string? FirstName { get; init; }

    public required string? LoginEmail { get; init; }
}
