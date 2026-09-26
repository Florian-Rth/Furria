namespace Furria.Infrastructure.Identity;

public sealed record PasswordResetCredential(int AccountId, string Token);
