namespace Furria.MediaWorker.Renditions;

public sealed class MediaRenderingException : Exception
{
    public MediaRenderingException(string message)
        : base(message) { }

    public MediaRenderingException(string message, Exception innerException)
        : base(message, innerException) { }
}
