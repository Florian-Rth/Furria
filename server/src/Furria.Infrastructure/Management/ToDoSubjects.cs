using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using Furria.Application.Management;

namespace Furria.Infrastructure.Management;

public static class ToDoSubjects
{
    private const int VersionLength = 16;
    private const char SubjectSeparator = '\n';

    [Pure]
    public static ToDoSummary SummaryOf(
        ToDoKind kind,
        IReadOnlyCollection<string> subjects,
        IReadOnlySet<string> seenSubjects
    )
    {
        var unseenCount = subjects.Count(subject => !seenSubjects.Contains(subject));
        var isSeen = unseenCount < subjects.Count;

        return new ToDoSummary
        {
            Kind = kind,
            Count = subjects.Count,
            IsSeen = isSeen,
            NewCount = isSeen ? unseenCount : 0,
            Version = VersionOf(subjects),
        };
    }

    [Pure]
    public static string VersionOf(IEnumerable<string> subjects)
    {
        var fingerprint = string.Join(SubjectSeparator, subjects.Order(StringComparer.Ordinal));

        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(fingerprint)))[
            ..VersionLength
        ];
    }
}
