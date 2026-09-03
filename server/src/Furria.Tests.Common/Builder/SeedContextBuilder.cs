namespace Furria.Tests.Common.Builder;

public sealed class SeedContextBuilder
{
    private readonly IdentitySeedBuilder _identity = new();

    internal IdentitySeedBuilder RecordedIdentity => _identity;

    public SeedContextBuilder Identity(Action<IdentitySeedBuilder> configure)
    {
        configure(_identity);
        return this;
    }
}
