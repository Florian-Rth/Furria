using Furria.Core.Identity;
using Furria.Core.MembershipApplications;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class RegistryGapsTests
{
    private static readonly DateOnly BirthDate = new(1996, 4, 3);

    private static readonly ContactDetails Applied = new()
    {
        Email = "mia@example.com",
        Phone = "0221 987654",
        Street = "Rosenweg 12a",
        Zip = "50667",
        City = "Köln",
    };

    private static readonly ContactDetails Nothing = new()
    {
        Email = null,
        Phone = null,
        Street = null,
        Zip = null,
        City = null,
    };

    [Fact]
    public void Should_NameEveryGap_When_TheRegistryHoldsNothing()
    {
        Assert.Equal(
            new[]
            {
                RegistryGap.BirthDate,
                RegistryGap.Email,
                RegistryGap.Phone,
                RegistryGap.Address,
            },
            RegistryGaps.Of(null, Nothing, Applied)
        );
    }

    [Fact]
    public void Should_CountABlankValueAsAGap_When_TheRegistryHoldsWhitespace()
    {
        Assert.Equal(
            new[] { RegistryGap.Email },
            RegistryGaps.Of(BirthDate, Applied with { Email = " " }, Applied)
        );
    }

    [Fact]
    public void Should_LeaveThePhoneAlone_When_TheApplicationGaveNone()
    {
        Assert.Empty(
            RegistryGaps.Of(BirthDate, Applied with { Phone = null }, Applied with { Phone = null })
        );
    }

    [Fact]
    public void Should_KeepAPartialAddressWhole_When_TheRegistryKnowsOnlyTheCity()
    {
        var recorded = Nothing with { City = "Bonn" };

        var filled = RegistryGaps.Filled(recorded, Applied);

        Assert.Null(filled.Street);
        Assert.Null(filled.Zip);
        Assert.Equal("Bonn", filled.City);
    }

    [Fact]
    public void Should_FillOnlyTheGaps_When_TheRegistryHoldsSomeDetails()
    {
        var recorded = Nothing with { Email = "MIA@example.com" };

        var filled = RegistryGaps.Filled(recorded, Applied);

        Assert.Equal(Applied with { Email = "MIA@example.com" }, filled);
    }
}
