namespace Furria.Infrastructure.Identity;

public sealed record SignedOutMailRequest(SignedOutMailRequestKind Kind, string Email);
