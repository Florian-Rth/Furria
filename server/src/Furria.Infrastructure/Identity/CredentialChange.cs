namespace Furria.Infrastructure.Identity;

public enum CredentialChange
{
    PasswordReset = 1,
    PasswordChanged = 2,
    LoginEmailChanged = 3,
    AccessRecovered = 4,
    PasskeyAdded = 5,
}
