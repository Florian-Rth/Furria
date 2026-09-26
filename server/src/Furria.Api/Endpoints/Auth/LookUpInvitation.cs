using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Application.Identity;
using Furria.Core.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class LookUpInvitation : Endpoint<LookUpInvitationRequest, LookUpInvitationResponse>
{
    private static readonly LookUpInvitationResponse Dead = new()
    {
        Status = InvitationLookupStatus.Dead,
        FirstName = null,
        LoginEmail = null,
        ContactEmailTaken = null,
        Purpose = null,
        ClaimableLoginEmail = null,
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
        var credential = ToCredential(req);
        if (!_tokenRateLimiter.TryAcquire(credential))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var invitation = await _accountAccessService.LookUpAsync(credential, ct);

        await Send.OkAsync(invitation is null ? Dead : ToResponse(invitation), cancellation: ct);
    }

    private static InvitationCredential ToCredential(LookUpInvitationRequest request) =>
        new() { Token = request.Token, Code = request.Code };

    private static LookUpInvitationResponse ToResponse(InvitationLookupDetails invitation) =>
        new()
        {
            Status = InvitationLookupStatus.Live,
            FirstName = invitation.FirstName,
            LoginEmail = invitation.LoginEmail,
            ContactEmailTaken = invitation.ContactEmailTaken,
            Purpose = invitation.Purpose,
            ClaimableLoginEmail = invitation.ClaimableLoginEmail,
        };
}

public sealed record LookUpInvitationRequest
{
    public string? Token { get; init; }

    public string? Code { get; init; }
}

public sealed class LookUpInvitationValidator : Validator<LookUpInvitationRequest>
{
    public LookUpInvitationValidator()
    {
        RuleFor(request => request)
            .Must(request =>
                InvitationTokenLimits.HasExactlyOneCredential(request.Token, request.Code)
            )
            .OverridePropertyName(InvitationTokenLimits.CredentialField)
            .WithMessage(InvitationTokenLimits.ExactlyOneCredentialMessage);
        When(
            request => request.Token is not null,
            () =>
                RuleFor(request => request.Token)
                    .NotEmpty()
                    .MaximumLength(InvitationTokenLimits.Length)
        );
        When(
            request => request.Code is not null,
            () =>
                RuleFor(request => request.Code)
                    .NotEmpty()
                    .MaximumLength(InvitationTokenLimits.CodeLength)
        );
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

    public required bool? ContactEmailTaken { get; init; }

    public required InvitationPurpose? Purpose { get; init; }

    public required string? ClaimableLoginEmail { get; init; }
}
