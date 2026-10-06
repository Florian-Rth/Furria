using System.Diagnostics.Contracts;
using Furria.Application.MembershipApplications;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.MembershipApplications;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.MembershipApplications;

public sealed partial class MembershipApplicationService
{
    private const string UndecidedApplicationMissingMessage =
        "Diesen Antrag gibt es nicht mehr – er ist schon entschieden oder wurde nie bestätigt.";

    public async Task<IReadOnlyList<MembershipApplicationSummary>> GetUndecidedAsync(
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);
        var rows = await _dbContext
            .UndecidedApplications()
            .OrderBy(row => row.ConfirmedAt)
            .ThenBy(row => row.Id)
            .Select(row => new UndecidedRow(
                row.Id,
                row.FirstName,
                row.LastName,
                row.BirthDate,
                row.City,
                row.ConfirmedAt!.Value
            ))
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, today))];
    }

    public async Task<Result<MembershipApplicationDetails>> GetUndecidedAsync(
        int membershipApplicationId,
        CancellationToken ct
    )
    {
        var application = await UndecidedApplicationAsync(membershipApplicationId, ct);
        if (application is null)
            return Result<MembershipApplicationDetails>.NotFound(
                UndecidedApplicationMissingMessage
            );

        var today = ClubClock.Today(_timeProvider);
        var club = await ClubTermsAsync(ct);
        var candidates = await CandidatesAsync(application, today, ct);

        return Result<MembershipApplicationDetails>.Success(
            ToDetails(application, club.AgeOfConsent, candidates, today)
        );
    }

    public async Task<Result> DeclineAsync(int membershipApplicationId, CancellationToken ct)
    {
        var deleted = await _dbContext
            .UndecidedApplications()
            .Where(row => row.Id == membershipApplicationId)
            .ExecuteDeleteAsync(ct);

        return deleted == 0
            ? Result.NotFound(UndecidedApplicationMissingMessage)
            : Result.Success();
    }

    private Task<UndecidedApplicationRow?> UndecidedApplicationAsync(
        int membershipApplicationId,
        CancellationToken ct
    ) =>
        _dbContext
            .UndecidedApplications()
            .Where(row => row.Id == membershipApplicationId)
            .Select(row => new UndecidedApplicationRow(
                row.Id,
                row.FirstName,
                row.LastName,
                row.BirthDate,
                row.Street,
                row.Zip,
                row.City,
                row.Email,
                row.Phone,
                row.SubmittedAt,
                row.ConfirmedAt!.Value
            ))
            .SingleOrDefaultAsync(ct);

    [Pure]
    private static MembershipApplicationDetails ToDetails(
        UndecidedApplicationRow application,
        int ageOfConsent,
        IReadOnlyList<AdmissionCandidate> candidates,
        DateOnly today
    ) =>
        new()
        {
            MembershipApplicationId = application.Id,
            FirstName = application.FirstName,
            LastName = application.LastName,
            BirthDate = application.BirthDate,
            Age = ApplicantBirthDate.AgeOn(application.BirthDate, today),
            IsMinor = ApplicantBirthDate.IsMinorOn(application.BirthDate, today),
            Street = application.Street,
            Zip = application.Zip,
            City = application.City,
            Email = application.Email,
            Phone = application.Phone,
            SubmittedAt = application.SubmittedAt,
            ConfirmedAt = application.ConfirmedAt,
            AppliedOn = application.AppliedOn,
            AgeOfConsent = ageOfConsent,
            Candidates = candidates,
        };

    [Pure]
    private static MembershipApplicationSummary ToSummary(UndecidedRow row, DateOnly today) =>
        new()
        {
            MembershipApplicationId = row.Id,
            FirstName = row.FirstName,
            LastName = row.LastName,
            Age = ApplicantBirthDate.AgeOn(row.BirthDate, today),
            IsMinor = ApplicantBirthDate.IsMinorOn(row.BirthDate, today),
            City = row.City,
            ConfirmedAt = row.ConfirmedAt,
        };

    private sealed record UndecidedApplicationRow(
        int Id,
        string FirstName,
        string LastName,
        DateOnly BirthDate,
        string Street,
        string Zip,
        string City,
        string Email,
        string? Phone,
        DateTimeOffset SubmittedAt,
        DateTimeOffset ConfirmedAt
    )
    {
        [Pure]
        public DateOnly AppliedOn => ClubClock.DayOf(SubmittedAt);

        [Pure]
        public ApplicantKey Key => new(Email, FirstName, LastName, BirthDate);

        [Pure]
        public ContactDetails Contact =>
            new()
            {
                Email = Email,
                Phone = Phone,
                Street = Street,
                Zip = Zip,
                City = City,
            };
    }

    private sealed record UndecidedRow(
        int Id,
        string FirstName,
        string LastName,
        DateOnly BirthDate,
        string City,
        DateTimeOffset ConfirmedAt
    );
}
