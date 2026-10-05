using System.Diagnostics.Contracts;
using Furria.Core.MembershipApplications;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.MembershipApplications;

public static class UndecidedApplicationQuery
{
    [Pure]
    public static IQueryable<MembershipApplication> UndecidedApplications(
        this AppDbContext dbContext
    ) => dbContext.MembershipApplications.AsNoTracking().Where(row => row.ConfirmedAt != null);
}
