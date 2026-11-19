using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class IntakeExpectations
{
    private readonly Expected _expected;
    private readonly int _intakeId;

    internal IntakeExpectations(Expected expected, int intakeId)
    {
        _expected = expected;
        _intakeId = intakeId;
    }

    public Expected ToBeStartedBy(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).StartedByPersonId)
        );

    public Expected ToDecide(DateOnly? memberFrom, params int[] groupIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var intake = await SingleAsync(dbContext, ct);
                Assert.Equal(memberFrom, intake.MemberFrom);
                Assert.Equal(groupIds.Order(), intake.Groups.Select(link => link.GroupId).Order());
            }
        );

    public Expected ToHaveLabel(string? label) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(label, (await SingleAsync(dbContext, ct)).Label)
        );

    public Expected ToOpenUntil(DateTimeOffset expiresAt, string token) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var intake = await SingleAsync(dbContext, ct);
                Assert.Null(intake.SubmittedAt);
                Assert.Null(intake.DiscardedAt);
                Assert.Equal(expiresAt, intake.ExpiresAt);
                Assert.Equal(IntakeTokens.HashOfPresented(token), intake.TokenHash);
            }
        );

    public Expected ToBeDiscardedWithNothingOfHers() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var intake = await SingleAsync(dbContext, ct);
                Assert.NotNull(intake.DiscardedAt);
                Assert.Null(intake.TokenSeed);
                Assert.Null(intake.FirstName);
                Assert.Null(intake.LastName);
                Assert.Null(intake.BirthDate);
            }
        );

    public Expected ToBeCompletedAs(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var intake = await SingleAsync(dbContext, ct);
                Assert.NotNull(intake.CompletedAt);
                Assert.Equal(personId, intake.PersonId);
                Assert.Null(intake.TokenSeed);
                AssertHoldsNothingOfHers(intake);
            }
        );

    public Expected ToAwaitReviewHolding(string firstName, string lastName, string? email) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var intake = await SingleAsync(dbContext, ct);
                Assert.NotNull(intake.SubmittedAt);
                Assert.Null(intake.CompletedAt);
                Assert.Null(intake.PersonId);
                Assert.Null(intake.TokenSeed);
                Assert.Equal(firstName, intake.FirstName);
                Assert.Equal(lastName, intake.LastName);
                Assert.Equal(email, intake.Email);
            }
        );

    public Expected ToStayOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var intake = await SingleAsync(dbContext, ct);
                Assert.Null(intake.SubmittedAt);
                Assert.NotNull(intake.TokenSeed);
                AssertHoldsNothingOfHers(intake);
            }
        );

    private static void AssertHoldsNothingOfHers(Intake intake)
    {
        Assert.Null(intake.FirstName);
        Assert.Null(intake.LastName);
        Assert.Null(intake.BirthDate);
        Assert.Null(intake.Street);
        Assert.Null(intake.Zip);
        Assert.Null(intake.City);
        Assert.Null(intake.Phone);
        Assert.Null(intake.Email);
        Assert.False(intake.ContactVisibleToMembers);
    }

    private Task<Intake> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .Intakes.AsNoTracking()
            .Include(intake => intake.Groups)
            .SingleAsync(intake => intake.Id == _intakeId, ct);
}
