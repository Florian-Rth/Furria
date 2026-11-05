namespace Furria.Infrastructure.Push;

public sealed record PushReceiverKeys(byte[] PublicKey, byte[] AuthSecret);
