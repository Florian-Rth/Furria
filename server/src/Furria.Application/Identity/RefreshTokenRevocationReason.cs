namespace Furria.Application.Identity;

public enum RefreshTokenRevocationReason
{
    Rotated = 1,
    LoggedOut = 2,
    ReuseDetected = 3,
    AccountDisabled = 4,
}
