using Furria.Core.GroupMatcher;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class AdmissionAgeSetExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;

    internal AdmissionAgeSetExpectations(Expected expected, int groupId)
    {
        _expected = expected;
        _groupId = groupId;
    }

    public Expected ToBeExactly(params AdmissionAgeBand[] bands) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    bands.Order(),
                    (
                        await dbContext
                            .GroupAdmissionAges.AsNoTracking()
                            .Where(admissionAge => admissionAge.GroupId == _groupId)
                            .Select(admissionAge => admissionAge.Band)
                            .ToListAsync(ct)
                    ).Order()
                )
        );
}
