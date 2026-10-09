using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Infrastructure.Gallery;

public static class ZipNames
{
    private const int FirstRepeat = 2;

    [Pure]
    public static IReadOnlyList<string> Distinct(IReadOnlyList<string> fileNames)
    {
        var taken = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        return [.. fileNames.Select(fileName => Claim(taken, fileName))];
    }

    private static string Claim(HashSet<string> taken, string fileName)
    {
        var candidate = fileName;
        for (var repeat = FirstRepeat; !taken.Add(candidate); repeat++)
            candidate = RepeatOf(fileName, repeat);

        return candidate;
    }

    [Pure]
    private static string RepeatOf(string fileName, int repeat) =>
        string.Create(
            CultureInfo.InvariantCulture,
            $"{Path.GetFileNameWithoutExtension(fileName)} ({repeat}){Path.GetExtension(fileName)}"
        );
}
