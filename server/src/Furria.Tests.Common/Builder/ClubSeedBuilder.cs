namespace Furria.Tests.Common.Builder;

public sealed class ClubSeedBuilder
{
    private readonly List<SessionIntent> _sessions = [];

    internal IReadOnlyList<SessionIntent> Sessions => _sessions;

    public ClubSeedBuilder AddSession(
        string alias,
        int startYear,
        int? number = null,
        string? motto = null,
        string? signetSvg = null
    )
    {
        _sessions.Add(new SessionIntent(alias, startYear, number, motto, signetSvg));
        return this;
    }

    internal sealed record SessionIntent(
        string Alias,
        int StartYear,
        int? Number,
        string? Motto,
        string? SignetSvg
    );
}
