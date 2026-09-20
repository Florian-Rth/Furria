using System.Diagnostics.Contracts;
using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private async Task<IReadOnlyList<ClubHubBoardSeat>> BoardAsync(
        DateOnly today,
        CancellationToken ct
    )
    {
        var seats = await _runningBoardSeats.SeatsAsync(today, ct);

        return [.. seats.Select(ToBoardSeat)];
    }

    [Pure]
    private static ClubHubBoardSeat ToBoardSeat(RunningBoardSeat seat) =>
        new()
        {
            Person = new ClubHubPerson
            {
                PersonId = seat.PersonId,
                FirstName = seat.FirstName,
                LastName = seat.LastName,
                PortraitUrl = seat.PortraitUrl,
                OfficeName = seat.OfficeName,
            },
            OfficeName = seat.OfficeName,
            SortOrder = seat.SortOrder,
        };
}
