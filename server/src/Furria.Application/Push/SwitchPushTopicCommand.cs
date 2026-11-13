using Furria.Core.Push;

namespace Furria.Application.Push;

public sealed record SwitchPushTopicCommand
{
    public required int AccountId { get; init; }

    public required PushTopic Topic { get; init; }

    public required bool IsEnabled { get; init; }
}
