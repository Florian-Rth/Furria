namespace Furria.Application.Media;

public sealed class MediaOptions
{
    public const string SectionName = "Media";
    public const int MinimumSigningKeyLength = 32;

    public string RootPath { get; set; } = "";

    public string SigningKey { get; set; } = "";
}
