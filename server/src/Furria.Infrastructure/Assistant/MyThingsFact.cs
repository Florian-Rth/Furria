namespace Furria.Infrastructure.Assistant;

public sealed record MyThingsFact(
    IReadOnlyList<string> Groups,
    IReadOnlyList<OpenAnswerFact> OpenAnswers,
    IReadOnlyList<OwnResponseFact> OwnResponses
);
