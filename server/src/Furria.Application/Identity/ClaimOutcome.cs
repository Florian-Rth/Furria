namespace Furria.Application.Identity;

public enum ClaimOutcome
{
    Invited = 1,
    HasAccount = 2,
    HasEmail = 3,
    UnderAge = 4,
    NotFound = 5,
    Closed = 6,
}
