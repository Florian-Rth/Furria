using System.Diagnostics.Contracts;
using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

public static class ClubRecordGaps
{
    [Pure]
    public static int CountOf(ClubRecordDetails record) =>
        new[]
        {
            record.Name is not null,
            record.FoundedYear is not null,
            record is { Street: not null, Zip: not null, City: not null },
            record.Email is not null,
        }.Count(isRecorded => !isRecorded);
}
