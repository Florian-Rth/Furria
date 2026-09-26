using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class PersonAdoptionService
{
    private const string NoCandidateMessage =
        "Mit dieser Adresse gibt es keine Person, die nicht im Verein aktiv ist.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public PersonAdoptionService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<Result<AdoptionCandidateDetails>> GetCandidateAsync(
        string email,
        CancellationToken ct
    )
    {
        var normalizedEmail = email.Trim().ToUpperInvariant();
        var affiliated = _dbContext.People.Where(
            AffiliationQuery.IsAffiliatedOn(ClubClock.Today(_timeProvider))
        );

        var candidate = await _dbContext
            .People.AsNoTracking()
            .Where(person =>
                person.Email != null
                && person.Email.Trim().ToUpper() == normalizedEmail
                && !affiliated.Any(running => running.Id == person.Id)
            )
            .OrderByDescending(person => person.UpdatedAt)
            .ThenByDescending(person => person.Id)
            .Select(person => new AdoptionCandidateDetails
            {
                PersonId = person.Id,
                FirstName = person.FirstName,
                LastName = person.LastName,
                HasAccount = _dbContext.Users.Any(account => account.PersonId == person.Id),
            })
            .FirstOrDefaultAsync(ct);

        return candidate is null
            ? Result<AdoptionCandidateDetails>.NotFound(NoCandidateMessage)
            : Result<AdoptionCandidateDetails>.Success(candidate);
    }
}
