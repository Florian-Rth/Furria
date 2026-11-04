using System.Diagnostics.Contracts;
using FluentValidation;
using Furria.Api.Endpoints.Halls;

namespace Furria.Api.Endpoints.TablePlans;

public sealed class TablePlanDocumentValidator : AbstractValidator<TablePlanDocumentDto>
{
    public TablePlanDocumentValidator()
    {
        RuleFor(document => document.Seating).IsInEnum();
        RuleFor(document => document.Rows)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(rows => rows.Count <= HallLimits.MostRows)
            .Must(rows => AreDistinct(rows.Select(row => row.Id)))
            .WithMessage("Jede Tischreihe braucht eine eigene Kennung.");
        RuleFor(document => document.Groups)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(groups => groups.Count <= HallLimits.MostGroups)
            .Must(groups => AreDistinct(groups.Select(group => group.Id)))
            .WithMessage("Jede Tischgruppe braucht eine eigene Kennung.");
        RuleForEach(document => document.Rows).SetValidator(new TableRowValidator());
        RuleForEach(document => document.Groups).SetValidator(new TableGroupValidator());
        RuleFor(document => document)
            .Must(NameOnlyItsGroups)
            .When(document => document.Rows is not null && document.Groups is not null)
            .WithMessage("Eine Tischreihe nennt eine Tischgruppe, die es nicht gibt.");
    }

    [Pure]
    private static bool AreDistinct(IEnumerable<string> ids)
    {
        var listed = ids.ToList();
        return listed.Distinct(StringComparer.Ordinal).Count() == listed.Count;
    }

    [Pure]
    private static bool NameOnlyItsGroups(TablePlanDocumentDto document)
    {
        var groupIds = document.Groups.Select(group => group.Id).ToHashSet(StringComparer.Ordinal);
        return document.Rows.All(row => row.GroupId is null || groupIds.Contains(row.GroupId));
    }
}

public sealed class TableRowValidator : AbstractValidator<TableRowDto>
{
    public TableRowValidator()
    {
        RuleFor(row => row.Id).NotEmpty().MaximumLength(HallLimits.IdLength);
        RuleFor(row => row.TableTypeId).GreaterThan(0);
        RuleFor(row => row.Count).InclusiveBetween(1, HallLimits.MostTablesInRow);
        RuleFor(row => row.X).Must(PlanBounds.IsCoordinate);
        RuleFor(row => row.Y).Must(PlanBounds.IsCoordinate);
        RuleFor(row => row.Rotation).Must(rotation => PlanBounds.IsRotation(rotation));
        RuleFor(row => row.Seating).IsInEnum();
        RuleFor(row => row.GroupId).MaximumLength(HallLimits.IdLength);
        RuleFor(row => row.Sides).NotNull();
        RuleFor(row => row.Number).MaximumLength(HallLimits.NumberLength);
        RuleFor(row => row.Note).MaximumLength(HallLimits.NoteLength);
        RuleFor(row => row.Chairs)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(chairs => chairs.Count <= HallLimits.MostChairOverrides);
        RuleForEach(row => row.Chairs).SetValidator(new ChairOverrideValidator());
    }
}

public sealed class ChairOverrideValidator : AbstractValidator<ChairOverrideDto>
{
    public ChairOverrideValidator()
    {
        RuleFor(chair => chair.Side).IsInEnum();
        RuleFor(chair => chair.Index).InclusiveBetween(0, HallLimits.MostChairIndex);
        RuleFor(chair => chair.Number).MaximumLength(HallLimits.NumberLength);
        RuleFor(chair => chair.Note).MaximumLength(HallLimits.NoteLength);
    }
}

public sealed class TableGroupValidator : AbstractValidator<TableGroupDto>
{
    public TableGroupValidator()
    {
        RuleFor(group => group.Id).NotEmpty().MaximumLength(HallLimits.IdLength);
        RuleFor(group => group.Number).MaximumLength(HallLimits.NumberLength);
        RuleFor(group => group.Note).MaximumLength(HallLimits.NoteLength);
    }
}
