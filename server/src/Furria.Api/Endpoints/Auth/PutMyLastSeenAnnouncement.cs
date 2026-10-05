using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class PutMyLastSeenAnnouncement : Endpoint<PutMyLastSeenAnnouncementRequest>
{
    private readonly AccountService _accountService;

    public PutMyLastSeenAnnouncement(AccountService accountService)
    {
        _accountService = accountService;
    }

    public override void Configure()
    {
        Put("auth/me/last-seen-announcement");
        Description(builder => builder.Accepts<PutMyLastSeenAnnouncementRequest>());
    }

    public override async Task HandleAsync(
        PutMyLastSeenAnnouncementRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _accountService.SetLastSeenAnnouncementAsync(
            accountId.Value,
            req.SeenUpTo,
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

public sealed record PutMyLastSeenAnnouncementRequest
{
    public DateTimeOffset? SeenUpTo { get; init; }
}

public sealed class PutMyLastSeenAnnouncementValidator : Validator<PutMyLastSeenAnnouncementRequest>
{
    public PutMyLastSeenAnnouncementValidator()
    {
        RuleFor(request => request.SeenUpTo)
            .GreaterThan(DateTimeOffset.UnixEpoch)
            .When(request => request.SeenUpTo is not null);
    }
}
