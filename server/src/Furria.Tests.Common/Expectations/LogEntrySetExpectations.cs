using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class LogEntrySetExpectations
{
    private readonly Expected _expected;
    private readonly string _marker;

    internal LogEntrySetExpectations(Expected expected, string marker)
    {
        _expected = expected;
        _marker = marker;
    }

    public Expected ToHoldExactly(params string[] messages) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    messages.Order(StringComparer.Ordinal),
                    (
                        await dbContext
                            .LogEntries.AsNoTracking()
                            .Where(entry => entry.Message.Contains(_marker))
                            .Select(entry => entry.Message)
                            .ToListAsync(ct)
                    ).Order(StringComparer.Ordinal)
                )
        );

    public Expected ToHoldNone(params string[] messages) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Empty(
                    (
                        await dbContext
                            .LogEntries.AsNoTracking()
                            .Where(entry => entry.Message.Contains(_marker))
                            .Select(entry => entry.Message)
                            .ToListAsync(ct)
                    ).Intersect(messages, StringComparer.Ordinal)
                )
        );
}
