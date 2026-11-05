using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Push;
using Furria.Infrastructure.Push;

namespace Furria.Api.Endpoints.Push;

public sealed class RemoveMyPushSubscription : Endpoint<RemoveMyPushSubscriptionRequest>
{
    private readonly PushSubscriptionService _pushSubscriptionService;

    public RemoveMyPushSubscription(PushSubscriptionService pushSubscriptionService)
    {
        _pushSubscriptionService = pushSubscriptionService;
    }

    public override void Configure()
    {
        Post("push/subscription/remove");
    }

    public override async Task HandleAsync(
        RemoveMyPushSubscriptionRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await _pushSubscriptionService.UnsubscribeAsync(accountId.Value, req.Endpoint, ct);
        await Send.NoContentAsync(ct);
    }
}

public sealed record RemoveMyPushSubscriptionRequest
{
    public required string Endpoint { get; init; }
}

public sealed class RemoveMyPushSubscriptionValidator : Validator<RemoveMyPushSubscriptionRequest>
{
    public RemoveMyPushSubscriptionValidator()
    {
        RuleFor(request => request.Endpoint).NotEmpty().MaximumLength(PushEndpoint.MaxLength);
    }
}
