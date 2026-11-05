using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Push;
using Furria.Infrastructure.Push;

namespace Furria.Api.Endpoints.Push;

public sealed class PutMyPushSubscription : Endpoint<PutMyPushSubscriptionRequest>
{
    private readonly PushSubscriptionService _pushSubscriptionService;

    public PutMyPushSubscription(PushSubscriptionService pushSubscriptionService)
    {
        _pushSubscriptionService = pushSubscriptionService;
    }

    public override void Configure()
    {
        Put("push/subscription");
    }

    public override async Task HandleAsync(PutMyPushSubscriptionRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await _pushSubscriptionService.SubscribeAsync(
            new SubscribePushDeviceCommand
            {
                AccountId = accountId.Value,
                Endpoint = req.Endpoint,
                PublicKey = req.Keys.P256dh,
                AuthSecret = req.Keys.Auth,
            },
            ct
        );

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutMyPushSubscriptionRequest
{
    public required string Endpoint { get; init; }

    public required PushSubscriptionKeysDto Keys { get; init; }
}

public sealed record PushSubscriptionKeysDto
{
    public required string P256dh { get; init; }

    public required string Auth { get; init; }
}

public sealed class PutMyPushSubscriptionValidator : Validator<PutMyPushSubscriptionRequest>
{
    public PutMyPushSubscriptionValidator()
    {
        RuleFor(request => request.Endpoint).Must(PushEndpoint.IsKnownPushService);
        RuleFor(request => request.Keys).NotNull();
        RuleFor(request => request.Keys.P256dh)
            .Must(PushKeys.IsPublicKey)
            .When(request => request.Keys is not null);
        RuleFor(request => request.Keys.Auth)
            .Must(PushKeys.IsAuthSecret)
            .When(request => request.Keys is not null);
    }
}
