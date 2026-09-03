namespace Furria.Application.Identity;

public sealed class RefreshTokenOptions
{
    public const string SectionName = "Auth:RefreshToken";

    public TimeSpan Lifetime { get; set; } = TimeSpan.FromDays(30);

    public TimeSpan ReuseGraceWindow { get; set; } = TimeSpan.FromSeconds(30);
}
