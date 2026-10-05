using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.MembershipApplications;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.MembershipApplications;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.MembershipApplications;

public sealed partial class MembershipApplicationService
{
    private const string GermanDateFormat = "dd.MM.yyyy";
    private const string NotACandidateMessage =
        "Diese Person passt nicht zum Antrag – sie teilt weder die E-Mail-Adresse noch Name und Geburtsdatum.";

    public async Task<Result<AdmissionDetails>> AdmitAsync(
        AdmitMembershipApplicationCommand command,
        CancellationToken ct
    )
    {
        var applicant = await UndecidedApplicationAsync(command.MembershipApplicationId, ct);
        if (applicant is null)
            return Result<AdmissionDetails>.NotFound(UndecidedApplicationMissingMessage);

        if (AdmissionRefusalOf(command, applicant) is { } refusal)
            return Result<AdmissionDetails>.Validation(RefusalMessage(refusal, applicant));

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var admission = await RecordAdmissionAsync(command, applicant, ct);
        if (admission.IsSuccess)
            await transaction.CommitAsync(ct);

        return admission;
    }

    private async Task<Result<AdmissionDetails>> RecordAdmissionAsync(
        AdmitMembershipApplicationCommand command,
        UndecidedApplicationRow applicant,
        CancellationToken ct
    )
    {
        if (!await ClaimAsync(command.MembershipApplicationId, ct))
            return Result<AdmissionDetails>.NotFound(UndecidedApplicationMissingMessage);

        var personId = await AdmittedPersonAsync(command, applicant, ct);
        if (!personId.IsSuccess)
            return Result<AdmissionDetails>.Carrying(personId);

        var membershipId = await _membershipService.AddAdmittedAsync(
            ToAdmittedMembership(personId.Value, command, applicant),
            ct
        );
        if (!membershipId.IsSuccess)
            return Result<AdmissionDetails>.Carrying(membershipId);

        var invitation = await _accountAccessService.InviteAdmittedAsync(
            personId.Value,
            command.AdmitterPersonId,
            ct
        );
        if (!invitation.IsSuccess)
            return Result<AdmissionDetails>.Carrying(invitation);

        return Result<AdmissionDetails>.Success(
            new AdmissionDetails
            {
                PersonId = personId.Value,
                MembershipId = membershipId.Value,
                Invitation = invitation.Value,
            }
        );
    }

    private async Task<Result<int>> AdmittedPersonAsync(
        AdmitMembershipApplicationCommand command,
        UndecidedApplicationRow applicant,
        CancellationToken ct
    ) =>
        command.PersonId is { } personId
            ? await FilledCandidateAsync(personId, command.AdmitterPersonId, applicant, ct)
            : await _personService.CreateAsync(ToNewPerson(applicant), ct);

    private async Task<Result<int>> FilledCandidateAsync(
        int personId,
        int admitterPersonId,
        UndecidedApplicationRow applicant,
        CancellationToken ct
    )
    {
        var candidates = await CandidatesAsync(applicant, ClubClock.Today(_timeProvider), ct);
        var candidate = candidates.SingleOrDefault(row => row.PersonId == personId);
        if (candidate is null)
            return Result<int>.Conflict(NotACandidateMessage);
        if (candidate.IsMember)
            return Result<int>.Conflict($"{candidate.FirstName} ist bereits Mitglied.");

        var filled = await _personService.FillGapsAsync(
            ToGapFill(personId, applicant, admitterPersonId),
            ct
        );

        return filled.IsSuccess ? Result<int>.Success(personId) : Result<int>.Carrying(filled);
    }

    private async Task<bool> ClaimAsync(int membershipApplicationId, CancellationToken ct) =>
        await _dbContext
            .UndecidedApplications()
            .Where(row => row.Id == membershipApplicationId)
            .ExecuteDeleteAsync(ct) == 1;

    [Pure]
    private static AdmissionRefusal? AdmissionRefusalOf(
        AdmitMembershipApplicationCommand command,
        UndecidedApplicationRow applicant
    ) =>
        MembershipAdmission.RefusalOf(
            command.AdmittedOn,
            applicant.AppliedOn,
            applicant.BirthDate,
            command.GuardianConsentConfirmed
        );

    private AddAdmittedMembershipCommand ToAdmittedMembership(
        int personId,
        AdmitMembershipApplicationCommand command,
        UndecidedApplicationRow applicant
    ) =>
        new()
        {
            PersonId = personId,
            AdmittedOn = command.AdmittedOn,
            AdmittedAt = _timeProvider.GetUtcNow(),
            AdmittedByPersonId = command.AdmitterPersonId,
            GuardianConsentConfirmed = ConfirmsGuardianConsent(command, applicant),
        };

    [Pure]
    private static bool ConfirmsGuardianConsent(
        AdmitMembershipApplicationCommand command,
        UndecidedApplicationRow applicant
    ) =>
        command.GuardianConsentConfirmed
        && MembershipAdmission.NeedsGuardianConsent(applicant.BirthDate, command.AdmittedOn);

    [Pure]
    private static string RefusalMessage(
        AdmissionRefusal refusal,
        UndecidedApplicationRow applicant
    ) =>
        refusal switch
        {
            AdmissionRefusal.BeforeApplication =>
                $"Aufgenommen werden kann {applicant.FirstName} frühestens am Tag ihres Antrags, dem {GermanDayOf(applicant.AppliedOn)}.",
            AdmissionRefusal.GuardianConsentMissing =>
                $"{applicant.FirstName} ist am Aufnahmetag noch minderjährig. Bestätige, dass die Einwilligung der gesetzlichen Vertretung vorliegt.",
            _ => throw new ArgumentOutOfRangeException(nameof(refusal), refusal, null),
        };

    [Pure]
    private static string GermanDayOf(DateOnly day) =>
        day.ToString(GermanDateFormat, CultureInfo.InvariantCulture);

    [Pure]
    private static FillPersonGapsCommand ToGapFill(
        int personId,
        UndecidedApplicationRow applicant,
        int admitterPersonId
    ) =>
        new()
        {
            PersonId = personId,
            BirthDate = applicant.BirthDate,
            Email = applicant.Email,
            Phone = applicant.Phone,
            Street = applicant.Street,
            Zip = applicant.Zip,
            City = applicant.City,
            ActorPersonId = admitterPersonId,
        };

    [Pure]
    private static CreatePersonCommand ToNewPerson(UndecidedApplicationRow applicant) =>
        new()
        {
            FirstName = applicant.FirstName,
            LastName = applicant.LastName,
            Email = applicant.Email,
            Phone = applicant.Phone,
            Street = applicant.Street,
            Zip = applicant.Zip,
            City = applicant.City,
            BirthDate = applicant.BirthDate,
            ContactVisibleToMembers = false,
        };
}
