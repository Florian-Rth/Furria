using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Text;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantVenueFacts
{
    [Pure]
    public static VenueFact VenueOf(VenueSummary venue) =>
        new(
            venue.Name,
            ClubAssistantFacts.AddressOf(venue.Street, venue.Zip, venue.City),
            venue.Hint,
            ClubAssistantFacts.OpeningHoursOf(venue.OpeningHours)
        );

    [Pure]
    public static RunningVenueSummary? FindAmong(
        IReadOnlyList<RunningVenueSummary> venues,
        string wanted
    )
    {
        var folded = GermanFold.Strip(wanted.Trim());
        if (folded.Length == 0)
            return null;

        var containing = venues
            .Where(venue => GermanFold.Strip(venue.Name).Contains(folded, StringComparison.Ordinal))
            .ToList();
        return containing.FirstOrDefault(venue => GermanFold.Strip(venue.Name) == folded)
            ?? (containing.Count == 1 ? containing[0] : null);
    }

    [Pure]
    public static VenueOccupancyFact OccupancyOf(
        string venueName,
        ClubAssistantSpan span,
        VenueOccupancy occupancy,
        IReadOnlyList<UsualTrainingSummary> usualTrainings,
        string appUrl
    ) =>
        new(
            venueName,
            ClubAssistantFacts.MomentOf(span.StartsAt),
            ClubAssistantFacts.MomentOf(span.EndsAt),
            occupancy.SeenEntries.Count == 0
                && occupancy.UnseenEntryCount == 0
                && usualTrainings.Count == 0,
            [.. occupancy.SeenEntries.Select(entry => ClubAssistantFacts.EntryOf(entry, appUrl))],
            [.. usualTrainings.Select(ClubAssistantFacts.UsualTrainingOf)],
            occupancy.UnseenEntryCount
        );

    [Pure]
    public static IReadOnlyList<UsualTrainingSummary> UsualTrainingsWithin(
        IReadOnlyList<UsualTrainingSummary> trainings,
        int venueId,
        ClubAssistantSpan span
    ) =>
        [
            .. trainings.Where(training =>
                training.VenueId == venueId && span.Overlaps(training.StartsAt, training.EndsAt)
            ),
        ];
}
