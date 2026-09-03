namespace Furria.Application.Identity;

public sealed class AccessTokenOptions
{
    public const string SectionName = "Auth:AccessToken";

    public string Issuer { get; set; } = "";

    public string Audience { get; set; } = "";

    public string SigningKey { get; set; } = "";

    public TimeSpan Lifetime { get; set; } = TimeSpan.FromMinutes(15);
}
