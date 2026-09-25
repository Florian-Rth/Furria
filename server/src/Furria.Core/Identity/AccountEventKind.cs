namespace Furria.Core.Identity;

public enum AccountEventKind
{
    Invited = 1,
    Reminded = 2,
    Redeemed = 3,
    Recovered = 4,
    Disabled = 5,
    Enabled = 6,
    Deleted = 7,
    LoginEmailChanged = 8,
}
