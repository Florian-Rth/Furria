using Furria.Application.RunningOrders;

namespace Furria.Application.Studio;

public sealed record ActCoEditorDetails
{
    public required CastMember Person { get; init; }

    public required DateTimeOffset GrantedAt { get; init; }
}
