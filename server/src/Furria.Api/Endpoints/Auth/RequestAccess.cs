using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class RequestAccess : Endpoint<RequestAccessRequest>
{
    private readonly SignedOutMailRequestQueue _requestQueue;
    private readonly AddressRateLimiter _addressRateLimiter;

    public RequestAccess(
        SignedOutMailRequestQueue requestQueue,
        AddressRateLimiter addressRateLimiter
    )
    {
        _requestQueue = requestQueue;
        _addressRateLimiter = addressRateLimiter;
    }

    public override void Configure()
    {
        Post("auth/access/request");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(RequestAccessRequest req, CancellationToken ct)
    {
        if (!_addressRateLimiter.TryAcquire(AddressRateLimitScope.AccessRequest, req.Email))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        _requestQueue.RequestAccess(req.Email);
        await Send.StatusCodeAsync(StatusCodes.Status202Accepted, ct);
    }
}

public sealed record RequestAccessRequest
{
    public required string Email { get; init; }
}

public sealed class RequestAccessValidator : Validator<RequestAccessRequest>
{
    public RequestAccessValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty()
            .MaximumLength(SignedOutEmailLimits.Length)
            .EmailAddress();
    }
}
