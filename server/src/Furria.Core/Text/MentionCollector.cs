namespace Furria.Core.Text;

internal sealed class MentionCollector
{
    private readonly IReadOnlySet<MentionKind> _mentionableKinds;
    private readonly List<Mention> _collected = [];

    public MentionCollector(IReadOnlySet<MentionKind> mentionableKinds)
    {
        _mentionableKinds = mentionableKinds;
    }

    public bool TryCollect(string target)
    {
        if (MentionTarget.MentionOf(target, _mentionableKinds) is not { } mention)
            return false;

        _collected.Add(mention);
        return true;
    }

    public IReadOnlyList<Mention> Distinct() => [.. _collected.Distinct()];
}
