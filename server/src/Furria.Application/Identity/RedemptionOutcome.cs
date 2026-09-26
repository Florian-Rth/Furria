namespace Furria.Application.Identity;

public enum RedemptionOutcome
{
    Redeemed = 1,
    ConfirmationRequired = 2,
    LoginEmailTaken = 3,
    ConfirmationCodeWrong = 4,
    ConfirmationCodeDead = 5,
}
