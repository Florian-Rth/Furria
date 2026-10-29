using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;

namespace Furria.Api.Endpoints.Venues;

public sealed class OpeningHoursValidator : Validator<IReadOnlyList<OpeningSlotDataDto>>
{
    private const string TooManySlotsMessage = "So viele Öffnungszeiten passen nicht zu einem Ort.";
    private const string OverlapMessage =
        "Öffnungszeiten eines Wochentags dürfen sich nicht überschneiden.";

    public OpeningHoursValidator()
    {
        RuleFor(slots => slots)
            .Must(slots => slots.Count <= VenueLimits.MaxOpeningSlots)
            .WithMessage(TooManySlotsMessage);
        RuleFor(slots => slots)
            .Must(slots => !HaveOverlap(slots))
            .WithMessage(OverlapMessage)
            .When(slots => slots.All(slot => slot is not null));
        RuleForEach(slots => slots).NotNull().SetValidator(new OpeningSlotDataValidator());
    }

    [Pure]
    private static bool HaveOverlap(IReadOnlyList<OpeningSlotDataDto> slots) =>
        slots
            .GroupBy(slot => slot.Weekday)
            .Any(day =>
                day.OrderBy(slot => slot.Opens)
                    .Zip(day.OrderBy(slot => slot.Opens).Skip(1))
                    .Any(pair => pair.Second.Opens < pair.First.Closes)
            );
}

public sealed class OpeningSlotDataValidator : Validator<OpeningSlotDataDto>
{
    private const string ClosesBeforeOpensMessage = "Ein Ort schließt erst, nachdem er öffnet.";

    public OpeningSlotDataValidator()
    {
        RuleFor(slot => slot.Weekday).IsInEnum();
        RuleFor(slot => slot.Closes)
            .GreaterThan(slot => slot.Opens)
            .WithMessage(ClosesBeforeOpensMessage);
    }
}
