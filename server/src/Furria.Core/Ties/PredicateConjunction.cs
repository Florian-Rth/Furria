using System.Diagnostics.Contracts;
using System.Linq.Expressions;

namespace Furria.Core.Ties;

internal static class PredicateConjunction
{
    [Pure]
    public static Expression<Func<T, bool>> And<T>(
        this Expression<Func<T, bool>> first,
        Expression<Func<T, bool>> second
    )
    {
        var subject = first.Parameters[0];
        var secondOfSubject = new ParameterSwap(second.Parameters[0], subject).Visit(second.Body);

        return Expression.Lambda<Func<T, bool>>(
            Expression.AndAlso(first.Body, secondOfSubject),
            subject
        );
    }

    private sealed class ParameterSwap : ExpressionVisitor
    {
        private readonly ParameterExpression _from;
        private readonly ParameterExpression _to;

        public ParameterSwap(ParameterExpression from, ParameterExpression to)
        {
            _from = from;
            _to = to;
        }

        protected override Expression VisitParameter(ParameterExpression node) =>
            node == _from ? _to : base.VisitParameter(node);
    }
}
