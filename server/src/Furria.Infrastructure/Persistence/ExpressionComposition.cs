using System.Diagnostics.Contracts;
using System.Linq.Expressions;

namespace Furria.Infrastructure.Persistence;

public static class ExpressionComposition
{
    [Pure]
    public static Expression<Func<T, TResult>> Bind<T, TArgument, TResult>(
        Expression<Func<T, TArgument, TResult>> body,
        Expression<Func<T, TArgument>> argument
    )
    {
        var subject = body.Parameters[0];
        var argumentOfSubject = ParameterSubstitution.Replace(
            argument.Body,
            argument.Parameters[0],
            subject
        );
        var bound = ParameterSubstitution.Replace(body.Body, body.Parameters[1], argumentOfSubject);

        return Expression.Lambda<Func<T, TResult>>(bound, subject);
    }

    private sealed class ParameterSubstitution : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;
        private readonly Expression _replacement;

        private ParameterSubstitution(ParameterExpression parameter, Expression replacement)
        {
            _parameter = parameter;
            _replacement = replacement;
        }

        public static Expression Replace(
            Expression body,
            ParameterExpression parameter,
            Expression replacement
        ) => new ParameterSubstitution(parameter, replacement).Visit(body);

        protected override Expression VisitParameter(ParameterExpression node) =>
            node == _parameter ? _replacement : base.VisitParameter(node);
    }
}
