namespace Furria.Api.Endpoints.Gallery;

public static class AlbumRequestMessages
{
    public const string TitleMissing = "Das Album braucht einen Titel.";
    public const string SessionTooEarly = "So früh beginnt keine Session des Vereins.";
    public const string TwoLinks =
        "Ein Album hängt an einem Kalendereintrag oder an einer Session, nicht an beidem.";
}
