using FastEndpoints;
using FluentValidation;

namespace Furria.Api.Endpoints.Events;

public sealed class PresaleVenueIdsValidator : Validator<IReadOnlyList<int>>
{
    private const string TooManyPlacesMessage = "So viele Vorverkaufsstellen passen nicht.";
    private const string RepeatedPlaceMessage = "Eine Vorverkaufsstelle steht nur einmal da.";
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";

    public PresaleVenueIdsValidator()
    {
        RuleFor(venueIds => venueIds)
            .Must(venueIds => venueIds.Count <= EventLimits.MaxPresalePlaces)
            .WithMessage(TooManyPlacesMessage);
        RuleFor(venueIds => venueIds)
            .Must(venueIds => venueIds.Distinct().Count() == venueIds.Count)
            .WithMessage(RepeatedPlaceMessage);
        RuleForEach(venueIds => venueIds).GreaterThan(0).WithMessage(UnknownVenueMessage);
    }
}
