namespace Furria.Infrastructure.Identity;

public enum ReauthenticationVerdict
{
    Proven = 1,
    Wrong = 2,
    LockedOut = 3,
}
