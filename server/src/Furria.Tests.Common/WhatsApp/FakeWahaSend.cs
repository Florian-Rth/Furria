namespace Furria.Tests.Common.WhatsApp;

public sealed record FakeWahaSend(
    string Kind,
    string ChatId,
    string Text,
    IReadOnlyList<string> Mentions,
    string MessageId
);
