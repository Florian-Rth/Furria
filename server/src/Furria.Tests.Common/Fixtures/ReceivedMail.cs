using System.Text.RegularExpressions;

namespace Furria.Tests.Common.Fixtures;

public sealed partial record ReceivedMail
{
    public required string Id { get; init; }

    public required string Subject { get; init; }

    public required string Text { get; init; }

    public required string Html { get; init; }

    public string LinkToken()
    {
        var match = LinkTokenPattern().Match(Text);
        if (!match.Success)
            throw new InvalidOperationException($"The mail \"{Subject}\" carries no token link.");

        return match.Groups["token"].Value;
    }

    public string Link()
    {
        var match = LinkPattern().Match(Text);
        if (!match.Success)
            throw new InvalidOperationException($"The mail \"{Subject}\" carries no link.");

        return match.Value;
    }

    [GeneratedRegex(@"#token=(?<token>[A-Za-z0-9_\-]+)")]
    private static partial Regex LinkTokenPattern();

    [GeneratedRegex(@"https?://\S+")]
    private static partial Regex LinkPattern();
}
