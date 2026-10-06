using System.Diagnostics.Contracts;
using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

public static class ClubRecordGaps
{
    public const string Name = "name";
    public const string FoundedYear = "foundedYear";
    public const string Address = "address";
    public const string Email = "email";

    [Pure]
    public static IReadOnlyList<string> MissingOf(ClubRecordDetails record) =>
        [
            .. new (string Fact, bool IsRecorded)[]
            {
                (Name, record.Name is not null),
                (FoundedYear, record.FoundedYear is not null),
                (Address, record is { Street: not null, Zip: not null, City: not null }),
                (Email, record.Email is not null),
            }
                .Where(fact => !fact.IsRecorded)
                .Select(fact => fact.Fact),
        ];

    [Pure]
    public static int CountOf(ClubRecordDetails record) => MissingOf(record).Count;
}
