using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class SessionExpectations
{
    private readonly Expected _expected;
    private readonly int _sessionId;

    internal SessionExpectations(Expected expected, int sessionId)
    {
        _expected = expected;
        _sessionId = sessionId;
    }

    public Expected ToHaveStartYear(int startYear) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(startYear, (await SingleAsync(dbContext, ct)).StartYear)
        );

    public Expected ToHaveNumber(int? number) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(number, (await SingleAsync(dbContext, ct)).Number)
        );

    public Expected ToHaveMotto(string? motto) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(motto, (await SingleAsync(dbContext, ct)).Motto)
        );

    public Expected ToHaveSignet(string? signetSvg) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(signetSvg, (await SingleAsync(dbContext, ct)).SignetSvg)
        );

    private Task<Session> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Sessions.AsNoTracking().SingleAsync(row => row.Id == _sessionId, ct);
}
