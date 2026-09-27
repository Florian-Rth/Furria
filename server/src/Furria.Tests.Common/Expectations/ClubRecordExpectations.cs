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

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext.ClubRecords.AsNoTracking().AnyAsync(ct),
                    "Expected no club record."
                )
        );

    public Expected ToHaveName(string? name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToHaveShortName(string? shortName) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(shortName, (await SingleAsync(dbContext, ct)).ShortName)
        );

    public Expected ToHaveAddress(string? street, string? zip, string? city) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var record = await SingleAsync(dbContext, ct);
                Assert.Equal((street, zip, city), (record.Street, record.Zip, record.City));
            }
        );

    public Expected ToHaveEmail(string? email) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(email, (await SingleAsync(dbContext, ct)).Email)
        );

    public Expected ToHavePhone(string? phone) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(phone, (await SingleAsync(dbContext, ct)).Phone)
        );

    public Expected ToHaveLinks(string? websiteUrl, string? instagramUrl, string? facebookUrl) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var record = await SingleAsync(dbContext, ct);
                Assert.Equal(
                    (websiteUrl, instagramUrl, facebookUrl),
                    (record.WebsiteUrl, record.InstagramUrl, record.FacebookUrl)
                );
            }
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

    private static Task<ClubRecord> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.ClubRecords.AsNoTracking().SingleAsync(ct);
}
