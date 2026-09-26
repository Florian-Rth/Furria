using Furria.Core.Identity;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class ContactDetailsTests
{
    private const string Email = "paula@example.test";
    private const string Phone = "0170 1234567";
    private const string Street = "Hauptstraße 12";
    private const string Zip = "99713";
    private const string City = "Großfurra";

    private static readonly ContactDetails Recorded = Details(Email, Phone, Street, Zip, City);

    [Theory]
    [InlineData("paula.brendel@example.test", Phone, Street, Zip, City)]
    [InlineData(Email, "03632 123456", Street, Zip, City)]
    [InlineData(Email, Phone, "Am Anger 3", Zip, City)]
    [InlineData(Email, Phone, Street, "99706", City)]
    [InlineData(Email, Phone, Street, Zip, "Sondershausen")]
    [InlineData(Email, null, Street, Zip, City)]
    [InlineData(Email, Phone, Street, Zip, "großfurra")]
    public void Should_BeAChange_When_OneFieldDiffers(
        string? email,
        string? phone,
        string? street,
        string? zip,
        string? city
    )
    {
        Assert.True(Details(email, phone, street, zip, city).DiffersFrom(Recorded));
    }

    [Fact]
    public void Should_BeNoChange_When_EveryFieldIsTheSame()
    {
        Assert.False(Details(Email, Phone, Street, Zip, City).DiffersFrom(Recorded));
    }

    [Fact]
    public void Should_BeNoChange_When_AnAbsentFieldIsSubmittedEmpty()
    {
        var recorded = Details(Email, null, "", Zip, City);

        Assert.False(Details(Email, "", null, Zip, City).DiffersFrom(recorded));
    }

    [Fact]
    public void Should_BeAChange_When_AnAbsentFieldIsFilledIn()
    {
        var recorded = Details(Email, null, Street, Zip, City);

        Assert.True(Details(Email, Phone, Street, Zip, City).DiffersFrom(recorded));
    }

    private static ContactDetails Details(
        string? email,
        string? phone,
        string? street,
        string? zip,
        string? city
    ) =>
        new()
        {
            Email = email,
            Phone = phone,
            Street = street,
            Zip = zip,
            City = city,
        };
}
