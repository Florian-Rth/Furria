using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Core.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class LookUpUploadLink : Endpoint<LookUpUploadLinkRequest, LookUpUploadLinkResponse>
{
    private readonly UploadLinkService _uploadLinkService;
    private readonly LinkUploadRateLimiter _rateLimiter;

    public LookUpUploadLink(UploadLinkService uploadLinkService, LinkUploadRateLimiter rateLimiter)
    {
        _uploadLinkService = uploadLinkService;
        _rateLimiter = rateLimiter;
    }

    public override void Configure()
    {
        Post("public/upload-links/lookup");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LookUpUploadLinkRequest req, CancellationToken ct)
    {
        if (!_rateLimiter.TryAcquire(HttpContext.Connection.RemoteIpAddress))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var link = await _uploadLinkService.LookUpAsync(req.Token, ct);
        if (link is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(
            new LookUpUploadLinkResponse
            {
                Title = link.Title,
                State = link.State,
                ExpiresAt = link.ExpiresAt,
            },
            cancellation: ct
        );
    }
}

public sealed record LookUpUploadLinkRequest
{
    public required string Token { get; init; }
}

public sealed class LookUpUploadLinkValidator : Validator<LookUpUploadLinkRequest>
{
    public LookUpUploadLinkValidator()
    {
        RuleFor(request => request.Token).NotEmpty().MaximumLength(UploadLink.TokenLength);
    }
}

public sealed record LookUpUploadLinkResponse
{
    public required string Title { get; init; }

    public required UploadLinkState State { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
