using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Push;
using Furria.Core.Push;
using Furria.Infrastructure.Push;

namespace Furria.Api.Endpoints.Push;

public sealed class PutMyPushTopic : Endpoint<PutMyPushTopicRequest>
{
    private readonly PushTopicService _pushTopicService;

    public PutMyPushTopic(PushTopicService pushTopicService)
    {
        _pushTopicService = pushTopicService;
    }

    public override void Configure()
    {
        Put("push/topics/{topic}");
    }

    public override async Task HandleAsync(PutMyPushTopicRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await _pushTopicService.SwitchAsync(
            new SwitchPushTopicCommand
            {
                AccountId = accountId.Value,
                Topic = req.Topic,
                IsEnabled = req.IsEnabled,
            },
            ct
        );
        await Send.NoContentAsync(ct);
    }
}

public sealed record PutMyPushTopicRequest
{
    [RouteParam]
    public required PushTopic Topic { get; init; }

    public required bool IsEnabled { get; init; }
}

public sealed class PutMyPushTopicValidator : Validator<PutMyPushTopicRequest>
{
    public PutMyPushTopicValidator()
    {
        RuleFor(request => request.Topic).IsInEnum();
    }
}
