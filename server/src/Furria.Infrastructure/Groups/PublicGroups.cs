using System.Linq.Expressions;
using Furria.Core.Groups;

namespace Furria.Infrastructure.Groups;

public static class PublicGroups
{
    public static readonly Expression<Func<Group, bool>> IsShown = group =>
        group.ArchivedOn == null;
}
