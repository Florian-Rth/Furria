namespace Furria.Application.Identity;

public sealed class PasskeyOptions
{
    public const string SectionName = "Passkeys";

    public string RelyingPartyId { get; set; } = "";
}
