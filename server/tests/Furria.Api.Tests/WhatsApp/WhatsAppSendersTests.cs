using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppSendersTests
{
    public static readonly TheoryData<string, string?> ChatIds = new()
    {
        { "491701234567@c.us", "491701234567" },
        { "491701234567@s.whatsapp.net", "491701234567" },
        { "491701234567:12@s.whatsapp.net", "491701234567" },
        { "4366412345678@c.us", "4366412345678" },
        { "123456789012345@lid", null },
        { "120363000000000001@g.us", null },
        { "notanumber@c.us", null },
    };

    [Theory]
    [MemberData(nameof(ChatIds))]
    public void Should_ReadTheInternationalDigits_When_TheChatIdCarriesAPhone(
        string chatId,
        string? digits
    )
    {
        Assert.Equal(digits, WhatsAppSenders.PhoneDigitsOf(chatId));
    }

    [Fact]
    public void Should_MatchThePerson_When_ExactlyOnePhoneNormalisesToTheSender()
    {
        WhatsAppPersonPhone[] people =
        [
            new(1, "0170 1234567"),
            new(2, "+49 171 7654321"),
            new(3, "kaputt"),
        ];

        Assert.Equal(1, WhatsAppSenders.PersonIdOf("491701234567", people));
    }

    [Fact]
    public void Should_MatchNobody_When_TwoPeopleShareTheNumber()
    {
        WhatsAppPersonPhone[] people = [new(1, "0170 1234567"), new(2, "0049 170 1234567")];

        Assert.Null(WhatsAppSenders.PersonIdOf("491701234567", people));
    }

    [Fact]
    public void Should_MatchNobody_When_NoPhoneNormalisesToTheSender()
    {
        WhatsAppPersonPhone[] people = [new(1, "0170 1234568")];

        Assert.Null(WhatsAppSenders.PersonIdOf("491701234567", people));
    }
}
