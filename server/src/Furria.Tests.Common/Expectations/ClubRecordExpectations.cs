using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class ClubRecordExpectations
{
    private readonly Expected _expected;

    internal ClubRecordExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveName(string? name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToHaveEmail(string? email) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(email, (await SingleAsync(dbContext, ct)).Email)
        );

    public Expected ToHaveFoundedYear(int? foundedYear) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(foundedYear, (await SingleAsync(dbContext, ct)).FoundedYear)
        );

    public Expected ToHaveAgeOfConsent(int ageOfConsent) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(ageOfConsent, (await SingleAsync(dbContext, ct)).AgeOfConsent)
        );

    public Expected ToHaveStage(decimal widthMetres, decimal depthMetres, string? artworkSvg) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var record = await SingleAsync(dbContext, ct);
                Assert.Equal(
                    (widthMetres, depthMetres, artworkSvg),
                    (record.StageWidthMetres, record.StageDepthMetres, record.StageArtworkSvg)
                );
            }
        );

    private static Task<ClubRecord> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.ClubRecords.AsNoTracking().SingleAsync(ct);
}
