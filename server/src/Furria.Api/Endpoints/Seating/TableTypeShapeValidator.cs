using System.Linq.Expressions;
using FluentValidation;
using Furria.Api.Endpoints.Halls;
using Furria.Core.Halls;

namespace Furria.Api.Endpoints.Seating;

public sealed class TableTypeShapeValidator<TRequest> : AbstractValidator<TRequest>
{
    public TableTypeShapeValidator(
        Expression<Func<TRequest, string>> name,
        Expression<Func<TRequest, TableShape>> shape,
        Expression<Func<TRequest, int>> lengthCm,
        Expression<Func<TRequest, int>> widthCm
    )
    {
        RuleFor(name)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("Die Tischart braucht einen Namen.")
            .MaximumLength(HallLimits.TableTypeNameLength);
        RuleFor(shape).IsInEnum();
        RuleFor(lengthCm).InclusiveBetween(HallLimits.ShortestTableCm, HallLimits.LongestTableCm);
        RuleFor(widthCm).InclusiveBetween(HallLimits.ShortestTableCm, HallLimits.WidestTableCm);
    }
}
