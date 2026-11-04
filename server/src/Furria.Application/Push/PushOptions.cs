using System.Diagnostics.Contracts;

namespace Furria.Application.Push;

public sealed class PushOptions
{
    public const string SectionName = "Push";

    private const string MailtoScheme = "mailto:";

    public string VapidPublicKey { get; set; } = "";

    public string VapidPrivateKey { get; set; } = "";

    public string Subject { get; set; } = "";

    [Pure]
    public static bool IsContact(string subject) =>
        subject.StartsWith(MailtoScheme, StringComparison.Ordinal)
            ? subject.Length > MailtoScheme.Length
            : Uri.TryCreate(subject, UriKind.Absolute, out var uri)
                && uri.Scheme == Uri.UriSchemeHttps;
}
