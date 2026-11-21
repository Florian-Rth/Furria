namespace Furria.Infrastructure.Media;

public sealed class MediaOwnerGoneException : Exception
{
    public MediaOwnerGoneException()
        : base("The owner stopped taking media while the upload was adopted.") { }
}
