namespace Furria.Api.Altcha;

public sealed class AltchaOptions
{
    public const string SectionName = "Altcha";
    public const int MinimumHmacKeyLength = 32;

    public string HmacKey { get; set; } = "";

    public int Cost { get; set; } = 5_000;

    public int MinCounter { get; set; } = 5_000;

    public int MaxCounter { get; set; } = 10_000;
}
