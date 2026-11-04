namespace Furria.Application.Push;

public sealed record PushDeliveryDetails
{
    public required int Delivered { get; init; }

    public required int Forgotten { get; init; }

    public required int Failed { get; init; }
}
