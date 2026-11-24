using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppSendersTests
{
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
}
