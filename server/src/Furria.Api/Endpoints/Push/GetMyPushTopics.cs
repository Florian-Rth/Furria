using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Push;
using Furria.Core.Push;
using Furria.Infrastructure.Push;

namespace Furria.Api.Endpoints.Push;

public sealed class GetMyPushTopics : EndpointWithoutRequest<GetMyPushTopicsResponse>
{
    private readonly PushTopicService _pushTopicService;

    public GetMyPushTopics(PushTopicService pushTopicService)
    {
        _pushTopicService = pushTopicService;
    }

    public override void Configure()
    {
        Get("push/topics");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var settings = await _pushTopicService.GetSettingsAsync(accountId.Value, ct);
        await Send.OkAsync(
            new GetMyPushTopicsResponse { Topics = [.. settings.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static PushTopicSettingDto ToDto(PushTopicSettingDetails setting) =>
        new() { Topic = setting.Topic, IsEnabled = setting.IsEnabled };
}

public sealed record GetMyPushTopicsResponse
{
    public required IReadOnlyList<PushTopicSettingDto> Topics { get; init; }
}

public sealed record PushTopicSettingDto
{
    public required PushTopic Topic { get; init; }

    public required bool IsEnabled { get; init; }
}
