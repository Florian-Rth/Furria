using Furria.Infrastructure.Identity;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class PasskeyNameTests
{
    [Theory]
    [InlineData(2026, 10, 3, "Passkey vom 3. Okt. 2026")]
    [InlineData(2027, 3, 14, "Passkey vom 14. März 2027")]
    [InlineData(2026, 9, 30, "Passkey vom 30. Sep. 2026")]
    [InlineData(2026, 5, 1, "Passkey vom 1. Mai 2026")]
    public void Should_NameThePasskeyByItsDay_When_SheChoseNoName(
        int year,
        int month,
        int day,
        string name
    )
    {
        Assert.Equal(name, PasskeyName.Chosen(null, new DateOnly(year, month, day)));
    }

    [Theory]
    [InlineData("  Mein Handy ", "Mein Handy")]
    [InlineData("   ", "Passkey vom 3. Okt. 2026")]
    [InlineData("", "Passkey vom 3. Okt. 2026")]
    public void Should_TrimHerNameOrFallBack_When_SheTypedOne(string typed, string name)
    {
        Assert.Equal(name, PasskeyName.Chosen(typed, new DateOnly(2026, 10, 3)));
    }
}
