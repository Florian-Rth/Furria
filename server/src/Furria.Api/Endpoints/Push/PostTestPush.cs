using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Push;
using Furria.Infrastructure.Push;

namespace Furria.Api.Endpoints.Push;

public sealed class PostTestPush : EndpointWithoutRequest<PostTestPushResponse>
{
    private static readonly PushMessage TestMessage = new()
    {
        Title = "Testnachricht",
        Body = "Benachrichtigungen kommen auf diesem Gerät an.",
        Url = "/system",
        Tag = "system-test",
        TimeToLive = TimeSpan.FromHours(1),
    };

    private readonly PushSender _pushSender;

    public PostTestPush(PushSender pushSender)
    {
        _pushSender = pushSender;
    }

    public override void Configure()
    {
        Post("system/test-push");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var delivery = await _pushSender.SendAsync(accountId.Value, TestMessage, ct);

        await Send.OkAsync(
            new PostTestPushResponse
            {
                Delivery = new PushDeliveryDto
                {
                    Delivered = delivery.Delivered,
                    Forgotten = delivery.Forgotten,
                    Failed = delivery.Failed,
                },
            },
            cancellation: ct
        );
    }
}

public sealed record PostTestPushResponse
{
    public required PushDeliveryDto Delivery { get; init; }
}

public sealed record PushDeliveryDto
{
    public required int Delivered { get; init; }

    public required int Forgotten { get; init; }

    public required int Failed { get; init; }
}
