namespace Furria.Application.Identity;

public sealed class ManagingLoginOptions
{
    public const string SectionName = "Auth:BootstrapAdmin";

    public string Email { get; set; } = "";

    public string Password { get; set; } = "";
}
