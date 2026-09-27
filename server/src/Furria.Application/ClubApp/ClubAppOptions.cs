namespace Furria.Application.ClubApp;

public sealed class ClubAppOptions
{
    public const string SectionName = "ClubApp";

    public string BaseUrl { get; set; } = "";

    public string[] AndroidCertFingerprints { get; set; } = [];
}
