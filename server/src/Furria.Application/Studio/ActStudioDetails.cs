using Furria.Application.RunningOrders;

namespace Furria.Application.Studio;

public sealed record ActStudioDetails
{
    public required ActSummary Act { get; init; }

    public required ActStudioViewer Viewer { get; init; }

    public required IReadOnlyList<ActCoEditorDetails> CoEditors { get; init; }

    public required ActStudioContent? Content { get; init; }
}
