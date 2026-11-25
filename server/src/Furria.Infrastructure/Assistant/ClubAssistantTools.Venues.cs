using System.ComponentModel;
using Furria.Application.Club;
using Furria.Core.Club;
using Microsoft.Extensions.AI;

namespace Furria.Infrastructure.Assistant;

public sealed partial class ClubAssistantTools
{
    private const string UnreadableTimeResult =
        "Die Uhrzeit verstehe ich nicht. Bitte als HH:mm, z. B. 14:00.";
    private const string UnknownVenueLead = "Diesen Ort kenne ich nicht. Bekannte Orte: ";

    private IEnumerable<AIFunction> VenueToolsFor(ClubAssistantAsker asker) =>
        [
            AIFunctionFactory.Create(
                VenuesAsync,
                Venues,
                "Orte des Vereins: Name, Adresse, Hinweis (z. B. Zugang) und Öffnungszeiten."
            ),
            AIFunctionFactory.Create(
                (
                    [Description("Name des Orts, wie ihn die Person nennt.")] string venue,
                    [Description("Tag (yyyy-MM-dd), Vereinszeit.")] DateOnly date,
                    [Description("Beginn (HH:mm).")] string from,
                    [Description("Ende (HH:mm); leer lassen, wenn nur ein Zeitpunkt gefragt ist.")]
                        string? to = null,
                    CancellationToken ct = default
                ) => VenueOccupancyAsync(asker, new VenueAsk(venue, date, from, to), ct),
                VenueOccupancy,
                "Ist ein Ort zur angegebenen Zeit frei? Wenn nicht: welche Einträge und üblichen "
                    + "Trainings dort liegen; otherBookings zählt Belegungen, die die Person "
                    + "nicht sehen darf."
            ),
        ];

    private async Task<IReadOnlyList<VenueFact>> VenuesAsync(CancellationToken ct) =>
        [
            .. (await _venueService.GetVenuesAsync(ct))
                .Where(venue => venue.ArchivedOn is null)
                .Select(ClubAssistantVenueFacts.VenueOf),
        ];

    private async Task<object> VenueOccupancyAsync(
        ClubAssistantAsker asker,
        VenueAsk ask,
        CancellationToken ct
    )
    {
        if (ClubAssistantSpan.Of(ask.Date, ask.From, ask.To) is not { } span)
            return UnreadableTimeResult;

        var venues = await _venueService.GetRunningVenuesAsync(ct);
        if (ClubAssistantVenueFacts.FindAmong(venues, ask.Venue) is not { } venue)
            return UnknownVenueLead + string.Join(", ", venues.Select(known => known.Name));

        var occupancy = await _calendarService.GetVenueOccupancyAsync(
            new VenueOccupancyQuery
            {
                PersonId = asker.PersonId,
                Rights = asker.CalendarRights,
                VenueId = venue.VenueId,
                StartsAt = span.StartsAt,
                EndsAt = span.EndsAt,
            },
            ct
        );
        var usualTrainings = await _usualTrainingService.GetUsualTrainingsBetweenAsync(
            ask.Date,
            ClubClock.DayOf(span.EndsAt),
            ct
        );

        return ClubAssistantVenueFacts.OccupancyOf(
            venue.Name,
            span,
            occupancy,
            ClubAssistantVenueFacts.UsualTrainingsWithin(usualTrainings, venue.VenueId, span),
            AppUrl
        );
    }

    private sealed record VenueAsk(string Venue, DateOnly Date, string From, string? To);
}
