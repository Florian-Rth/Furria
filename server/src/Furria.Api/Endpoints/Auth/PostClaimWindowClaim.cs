using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Api.Results;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class PostClaimWindowClaim
    : Endpoint<PostClaimWindowClaimRequest, PostClaimWindowClaimResponse>
{
    private readonly ClaimWindowService _claimWindowService;
    private readonly ClaimNameRateLimiter _claimNameRateLimiter;

    public PostClaimWindowClaim(
        ClaimWindowService claimWindowService,
        ClaimNameRateLimiter claimNameRateLimiter
    )
    {
        _claimWindowService = claimWindowService;
        _claimNameRateLimiter = claimNameRateLimiter;
    }

    public override void Configure()
    {
        Post("auth/claim-window/claims");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.OnboardingPerIpPolicy));
    }

    public override async Task HandleAsync(PostClaimWindowClaimRequest req, CancellationToken ct)
    {
        if (!_claimNameRateLimiter.TryAcquire(req.FirstName, req.LastName))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var claimed = await _claimWindowService.ClaimAsync(ToCommand(req), ct);
        if (!claimed.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(claimed.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(claimed.Value), cancellation: ct);
    }

    private static ClaimCommand ToCommand(PostClaimWindowClaimRequest request) =>
        new()
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            BirthDate = request.BirthDate,
        };

    private static PostClaimWindowClaimResponse ToResponse(ClaimDetails claim) =>
        new() { Outcome = claim.Outcome, Token = claim.Token };
}

public sealed record PostClaimWindowClaimRequest
{
    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }
}

public sealed class PostClaimWindowClaimValidator : Validator<PostClaimWindowClaimRequest>
{
    private const int NameLength = 128;

    private static readonly DateOnly EarliestBirthDate = new(1900, 1, 1);

    public PostClaimWindowClaimValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(NameLength);
        RuleFor(request => request.LastName).NotEmpty().MaximumLength(NameLength);
        RuleFor(request => request.BirthDate).GreaterThanOrEqualTo(EarliestBirthDate);
    }
}

public sealed record PostClaimWindowClaimResponse
{
    public required ClaimOutcome Outcome { get; init; }

    public required string? Token { get; init; }
}
