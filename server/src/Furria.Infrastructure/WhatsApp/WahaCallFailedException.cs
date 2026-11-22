using System.Diagnostics.Contracts;
using System.Net;
using System.Text.RegularExpressions;

namespace Furria.Infrastructure.WhatsApp;

public sealed partial class WahaCallFailedException : HttpRequestException
{
    private const int LongestQuotedAnswer = 300;

    public string Answer { get; }

    public bool IsRateSignal => IsRateSignalOf(StatusCode, Answer);

    public WahaCallFailedException(HttpStatusCode statusCode, string answer)
        : base(MessageOf(statusCode, answer), null, statusCode)
    {
        Answer = answer;
    }

    [Pure]
    public static bool IsRateSignalOf(HttpStatusCode? statusCode, string answer) =>
        statusCode == HttpStatusCode.TooManyRequests
        || RateLimitWord().IsMatch(answer)
        || (statusCode is { } status && (int)status >= 500 && RateCode().IsMatch(answer));

    [Pure]
    private static string MessageOf(HttpStatusCode statusCode, string answer) =>
        $"WAHA answered {(int)statusCode}: {answer[..Math.Min(answer.Length, LongestQuotedAnswer)]}";

    [GeneratedRegex("rate-overlimit", RegexOptions.IgnoreCase)]
    private static partial Regex RateLimitWord();

    [GeneratedRegex(@"\b(?:463|475)\b")]
    private static partial Regex RateCode();
}
