namespace Furria.Infrastructure.Identity;

public enum LoginFailureReason
{
    UnknownAccount,
    Disabled,
    WrongPassword,
    LockedOut,
    NotAllowed,
}
