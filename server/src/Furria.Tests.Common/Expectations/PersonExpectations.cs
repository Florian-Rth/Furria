using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class PersonExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal PersonExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext.People.AsNoTracking().AnyAsync(row => row.Id == _personId, ct),
                    $"Expected a Person with id {_personId}."
                )
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext.People.AsNoTracking().AnyAsync(row => row.Id == _personId, ct),
                    $"Expected no Person with id {_personId}."
                )
        );

    public Expected ToHaveName(string firstName, string lastName) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var person = await SingleAsync(dbContext, ct);
                Assert.Equal(firstName, person.FirstName);
                Assert.Equal(lastName, person.LastName);
            }
        );

    public Expected ToHaveContactVisible(bool visible) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(visible, (await SingleAsync(dbContext, ct)).ContactVisibleToMembers)
        );

    public Expected ToHaveBirthDate(DateOnly? birthDate) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(birthDate, (await SingleAsync(dbContext, ct)).BirthDate)
        );

    public Expected ToHaveContactDetails(
        string? email,
        string? phone,
        string? street,
        string? zip,
        string? city
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var person = await SingleAsync(dbContext, ct);
                Assert.Equal(email, person.Email);
                Assert.Equal(phone, person.Phone);
                Assert.Equal(street, person.Street);
                Assert.Equal(zip, person.Zip);
                Assert.Equal(city, person.City);
            }
        );

    public Expected ToHaveContactChangedBy(int? personId, DateTimeOffset changedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var person = await SingleAsync(dbContext, ct);
                Assert.Equal(personId, person.ContactChangedByPersonId);
                Assert.Equal(changedAt, person.ContactChangedAt);
            }
        );

    public Expected ToHaveNoContactChange() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var person = await SingleAsync(dbContext, ct);
                Assert.Null(person.ContactChangedByPersonId);
                Assert.Null(person.ContactChangedAt);
            }
        );

    public Expected ToBeArchived(DateOnly archivedOn, int? archivedByPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var person = await SingleAsync(dbContext, ct);
                Assert.Equal(archivedOn, person.ArchivedOn);
                Assert.Equal(archivedByPersonId, person.ArchivedByPersonId);
            }
        );

    public Expected ToNotBeArchived() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var person = await SingleAsync(dbContext, ct);
                Assert.Null(person.ArchivedOn);
                Assert.Null(person.ArchivedByPersonId);
            }
        );

    public Expected ToHaveBeenTouchedAt(DateTimeOffset updatedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(updatedAt, (await SingleAsync(dbContext, ct)).UpdatedAt)
        );

    public Expected ToHaveBeenCreatedAt(DateTimeOffset createdAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(createdAt, (await SingleAsync(dbContext, ct)).CreatedAt)
        );

    private Task<Person> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.People.AsNoTracking().SingleAsync(row => row.Id == _personId, ct);
}
