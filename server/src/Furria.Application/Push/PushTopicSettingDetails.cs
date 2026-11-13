using Furria.Core.Push;

namespace Furria.Application.Push;

public sealed record PushTopicSettingDetails
{
    public required PushTopic Topic { get; init; }

    public required bool IsEnabled { get; init; }
}
