namespace Furria.Tests.Common.Push;

public sealed record VapidClaims(string Audience, string Subject, DateTimeOffset ExpiresAt);
