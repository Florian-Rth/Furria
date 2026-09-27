using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class RequestPasswordReset : Endpoint<RequestPasswordResetRequest>
{
    private readonly SignedOutMailRequestQueue _requestQueue;
    private readonly AddressRateLimiter _addressRateLimiter;

    public RequestPasswordReset(
        SignedOutMailRequestQueue requestQueue,
        AddressRateLimiter addressRateLimiter
    )
    {
        _requestQueue = requestQueue;
        _addressRateLimiter = addressRateLimiter;
    }

    public override void Configure()
    {
        Post("auth/password/request-reset");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(RequestPasswordResetRequest req, CancellationToken ct)
    {
        if (!_addressRateLimiter.TryAcquire(AddressRateLimitScope.PasswordResetRequest, req.Email))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        _requestQueue.RequestPasswordReset(req.Email);
        await Send.StatusCodeAsync(StatusCodes.Status202Accepted, ct);
    }
}

public sealed record RequestPasswordResetRequest
{
    public required string Email { get; init; }
}

public sealed class RequestPasswordResetValidator : Validator<RequestPasswordResetRequest>
{
    public RequestPasswordResetValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty()
            .MaximumLength(SignedOutEmailLimits.Length)
            .EmailAddress();
    }
}
