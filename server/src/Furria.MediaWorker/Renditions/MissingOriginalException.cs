namespace Furria.MediaWorker.Renditions;

public sealed class MissingOriginalException : Exception
{
    private const string MissingOriginalMessage = "The original file is missing.";

    public MissingOriginalException()
        : base(MissingOriginalMessage) { }
}
