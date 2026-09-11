using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MembershipPauseExpectations
{
    private readonly Expected _expected;
    private readonly int _pauseId;

    internal MembershipPauseExpectations(Expected expected, int pauseId)
    {
        _expected = expected;
        _pauseId = pauseId;
    }

    public Expected ToHaveSpan(int firstSessionYear, int? lastSessionYear) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var pause = await dbContext
                    .MembershipPauses.AsNoTracking()
                    .SingleAsync(row => row.Id == _pauseId, ct);

                Assert.Equal(firstSessionYear, pause.FirstSessionYear);
                Assert.Equal(lastSessionYear, pause.LastSessionYear);
            }
        );
}
