using Furria.Application;
using Furria.Application.Push;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class PushOptionsTests
{
    private const string PublicKey =
        "BMhR4mFcMj4K9cYVgsAKgKIGevMvrCQLSM-Jy1kqfP4iSDlC7Pa4vNiXYZKmTo4mclU-aq_1BFfX8QuI46dHofQ";
    private const string PrivateKey = "GzIA-6S4MRXOlB2w1RDWAq_4D_CAYdtmWQCiTovlRZI";
    private const string ForeignPublicKey =
        "BJHhr67C7XxXwwubrRyhP_8OF76XsLlmZmkfdgKrO568BpUqFK0aVoi8rrIjT9jTdiqc24uI_1q4yFnAzA2yWVs";
    private const string Subject = "https://app.furria.de";

    [Theory]
    [InlineData("https://app.furria.de")]
    [InlineData("mailto:vorstand@furria.de")]
    public void Should_ReadTheKeys_When_TheyAreAPairWithAContactSubject(string subject)
    {
        var options = PushOptionsOf(PublicKey, PrivateKey, subject);

        Assert.Equal(PublicKey, options.VapidPublicKey);
    }

    [Theory]
    [InlineData("", "")]
    [InlineData(ForeignPublicKey, PrivateKey)]
    [InlineData(PublicKey, "not-a-key")]
    [InlineData("BMhR4mFcMj4K9cYVgsAKgKIG", PrivateKey)]
    public void Should_RefuseTheOptions_When_TheKeysAreNoPair(string publicKey, string privateKey)
    {
        Assert.Throws<OptionsValidationException>(() =>
            PushOptionsOf(publicKey, privateKey, Subject)
        );
    }

    [Theory]
    [InlineData("")]
    [InlineData("app.furria.de")]
    [InlineData("http://app.furria.de")]
    [InlineData("mailto:")]
    public void Should_RefuseTheOptions_When_TheSubjectIsNoContact(string subject)
    {
        Assert.Throws<OptionsValidationException>(() =>
            PushOptionsOf(PublicKey, PrivateKey, subject)
        );
    }

    private static PushOptions PushOptionsOf(string publicKey, string privateKey, string subject)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Push:VapidPublicKey"] = publicKey,
                    ["Push:VapidPrivateKey"] = privateKey,
                    ["Push:Subject"] = subject,
                }
            )
            .Build();
        using var provider = new ServiceCollection()
            .AddSingleton<IConfiguration>(configuration)
            .AddApplication()
            .BuildServiceProvider();

        return provider.GetRequiredService<IOptions<PushOptions>>().Value;
    }
}
