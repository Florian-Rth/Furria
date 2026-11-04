namespace Furria.Application.Push;

public sealed record SubscribePushDeviceCommand
{
    public required int AccountId { get; init; }

    public required string Endpoint { get; init; }

    public required string PublicKey { get; init; }

    public required string AuthSecret { get; init; }
}
