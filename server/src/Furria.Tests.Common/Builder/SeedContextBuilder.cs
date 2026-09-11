namespace Furria.Tests.Common.Builder;

public sealed class SeedContextBuilder
{
    private readonly IdentitySeedBuilder _identity = new();
    private readonly RoleSeedBuilder _roles = new();

    internal IdentitySeedBuilder RecordedIdentity => _identity;

    internal RoleSeedBuilder RecordedRoles => _roles;

    public SeedContextBuilder Identity(Action<IdentitySeedBuilder> configure)
    {
        configure(_identity);
        return this;
    }

    public SeedContextBuilder Roles(Action<RoleSeedBuilder> configure)
    {
        configure(_roles);
        return this;
    }
}
