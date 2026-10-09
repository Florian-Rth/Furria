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

    private ClubHubBoardSeat ToBoardSeat(RunningBoardSeat seat) =>
        new()
        {
            Person = new ClubHubPerson
            {
                PersonId = seat.PersonId,
                FirstName = seat.FirstName,
                LastName = seat.LastName,
                Portrait = _pictures.PortraitOf(
                    seat.PersonId,
                    seat.PortraitId,
                    seat.PortraitRenderedAt
                ),
                OfficeName = seat.OfficeName,
            },
            OfficeName = seat.OfficeName,
            SortOrder = seat.SortOrder,
        };
}
