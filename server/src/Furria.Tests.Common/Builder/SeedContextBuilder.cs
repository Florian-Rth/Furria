namespace Furria.Tests.Common.Builder;

public sealed class SeedContextBuilder
{
    private readonly IdentitySeedBuilder _identity = new();
    private readonly GroupSeedBuilder _groups = new();
    private readonly RoleSeedBuilder _roles = new();
    private readonly ClubSeedBuilder _club = new();
    private readonly GallerySeedBuilder _gallery = new();
    private readonly NewsSeedBuilder _news = new();

    internal IdentitySeedBuilder RecordedIdentity => _identity;

    internal GroupSeedBuilder RecordedGroups => _groups;

    internal RoleSeedBuilder RecordedRoles => _roles;

    internal ClubSeedBuilder RecordedClub => _club;

    internal GallerySeedBuilder RecordedGallery => _gallery;

    internal NewsSeedBuilder RecordedNews => _news;

    public SeedContextBuilder Identity(Action<IdentitySeedBuilder> configure)
    {
        configure(_identity);
        return this;
    }

    public SeedContextBuilder Groups(Action<GroupSeedBuilder> configure)
    {
        configure(_groups);
        return this;
    }

    public SeedContextBuilder Roles(Action<RoleSeedBuilder> configure)
    {
        configure(_roles);
        return this;
    }

    public SeedContextBuilder Club(Action<ClubSeedBuilder> configure)
    {
        configure(_club);
        return this;
    }

    public SeedContextBuilder Gallery(Action<GallerySeedBuilder> configure)
    {
        configure(_gallery);
        return this;
    }

    public SeedContextBuilder News(Action<NewsSeedBuilder> configure)
    {
        configure(_news);
        return this;
    }
}
