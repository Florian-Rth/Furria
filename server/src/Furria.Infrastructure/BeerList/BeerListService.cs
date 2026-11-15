using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed partial class BeerListService
{
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string OwnerWithoutRightMessage =
        "Nur wer die Bierliste führen darf, kann ihr Besitzer sein.";
    private const string NotEnrolledMessage = "Du stehst nicht auf der Bierliste.";
    private const string UnknownEnrollmentMessage =
        "Diese Teilnahme an der Bierliste gibt es nicht.";
    private const string EndedEnrollmentMessage = "Diese Teilnahme ist schon beendet.";
    private const string ClosedPotMessage =
        "Diese Bierliste ist übergeben und lässt sich nicht mehr einstellen.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public BeerListService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<Result<int>> OpenPotAsync(BeerPotOpenCommand command, CancellationToken ct)
    {
        if (!await PersonExistsAsync(command.OwnerPersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        if (!await MayManageAsync(command.OwnerPersonId, ct))
            return Result<int>.Validation(OwnerWithoutRightMessage);

        if (await _dbContext.BeerPots.AsNoTracking().AnyAsync(pot => pot.ClosedAt == null, ct))
            return Result<int>.Conflict(WriteConflictMessages.OpenBeerPot);

        var pot = new BeerPot
        {
            OwnerPersonId = command.OwnerPersonId,
            PaymentLink = command.PaymentLink,
            OpenedAt = _timeProvider.GetUtcNow(),
        };
        _dbContext.BeerPots.Add(pot);
        foreach (var drink in command.Drinks)
            _dbContext.BeerPotDrinks.Add(
                new BeerPotDrink
                {
                    Pot = pot,
                    Drink = await BeerDrinkCatalogue.DrinkNamedAsync(_dbContext, drink.Name, ct),
                    CratePriceCents = drink.CratePriceCents,
                    IsDefault = ReferenceEquals(drink, command.Drinks[0]),
                }
            );

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        return saved.IsSuccess ? Result<int>.Success(pot.Id) : Result<int>.Carrying(saved);
    }

    public async Task<Result> UpdatePaymentLinkAsync(
        int beerPotId,
        string? paymentLink,
        CancellationToken ct
    )
    {
        var updated = await _dbContext
            .BeerPots.Where(pot => pot.Id == beerPotId && pot.ClosedAt == null)
            .ExecuteUpdateAsync(
                row =>
                    row.SetProperty(pot => pot.PaymentLink, paymentLink)
                        .SetProperty(pot => pot.UpdatedAt, _timeProvider.GetUtcNow()),
                ct
            );
        if (updated > 0)
            return Result.Success();

        return await _dbContext.BeerPots.AsNoTracking().AnyAsync(pot => pot.Id == beerPotId, ct)
            ? Result.Conflict(ClosedPotMessage)
            : Result.NotFound(BeerListMessages.UnknownPot);
    }

    public async Task<BeerPotDetails?> GetOpenPotAsync(CancellationToken ct)
    {
        var pot = await _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => pot.ClosedAt == null)
            .Select(pot => new OpenPotRow(
                pot.Id,
                pot.Owner == null
                    ? null
                    : new BeerListPerson
                    {
                        PersonId = pot.Owner.Id,
                        FirstName = pot.Owner.FirstName,
                        LastName = pot.Owner.LastName,
                    },
                pot.PaymentLink,
                pot.OpenedAt
            ))
            .SingleOrDefaultAsync(ct);
        if (pot is null)
            return null;

        return new BeerPotDetails
        {
            BeerPotId = pot.BeerPotId,
            Owner = pot.Owner,
            PaymentLink = pot.PaymentLink,
            OpenedAt = pot.OpenedAt,
            Drinks = await ListedDrinksAsync(pot.BeerPotId, ct),
        };
    }

    public async Task<IReadOnlyList<BeerPotSummary>> GetPotsAsync(CancellationToken ct)
    {
        var openCrates = BeerPotLedger.OpenCrates(_dbContext);

        return await _dbContext
            .BeerPots.AsNoTracking()
            .OrderBy(pot => pot.ClosedAt != null)
            .ThenByDescending(pot => pot.OpenedAt)
            .ThenByDescending(pot => pot.Id)
            .Select(pot => new BeerPotSummary
            {
                BeerPotId = pot.Id,
                Owner =
                    pot.Owner == null
                        ? null
                        : new BeerListPerson
                        {
                            PersonId = pot.Owner.Id,
                            FirstName = pot.Owner.FirstName,
                            LastName = pot.Owner.LastName,
                        },
                OpenedAt = pot.OpenedAt,
                ClosedAt = pot.ClosedAt,
                OpenTabs = openCrates
                    .Where(crate => crate.BeerPotId == pot.Id && crate.PersonId != null)
                    .Select(crate => crate.PersonId)
                    .Distinct()
                    .Count(),
                OpenCrates = openCrates.Count(crate => crate.BeerPotId == pot.Id),
                OpenCents = openCrates
                    .Where(crate => crate.BeerPotId == pot.Id)
                    .Sum(crate => crate.PriceCents),
            })
            .ToListAsync(ct);
    }

    public async Task<Result> EnrollAsync(int personId, CancellationToken ct)
    {
        if (await IsEnrolledAsync(personId, ct))
            return Result.Conflict(WriteConflictMessages.RunningBeerListEnrollment);

        _dbContext.BeerListEnrollments.Add(
            new BeerListEnrollment { PersonId = personId, StartedAt = _timeProvider.GetUtcNow() }
        );

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> EndOwnEnrollmentAsync(int personId, CancellationToken ct)
    {
        var ended = await EndRunningAsync(
            _dbContext.BeerListEnrollments.Where(row => row.PersonId == personId),
            personId,
            ct
        );

        return ended ? Result.Success() : Result.Conflict(NotEnrolledMessage);
    }

    public async Task<Result> EndEnrollmentAsync(
        int enrollmentId,
        int? endedByPersonId,
        CancellationToken ct
    )
    {
        var enrollment = _dbContext.BeerListEnrollments.Where(row => row.Id == enrollmentId);
        if (await EndRunningAsync(enrollment, endedByPersonId, ct))
            return Result.Success();

        return await enrollment.AnyAsync(ct)
            ? Result.Conflict(EndedEnrollmentMessage)
            : Result.NotFound(UnknownEnrollmentMessage);
    }

    public async Task<IReadOnlyList<BeerListEnrollmentSummary>> GetEnrollmentsAsync(
        CancellationToken ct
    ) =>
        await _dbContext
            .BeerListEnrollments.AsNoTracking()
            .OrderBy(enrollment => enrollment.EndedAt != null)
            .ThenBy(enrollment =>
                EF.Functions.Collate(enrollment.Person!.LastName, GermanCollation.Name)
            )
            .ThenBy(enrollment =>
                EF.Functions.Collate(enrollment.Person!.FirstName, GermanCollation.Name)
            )
            .ThenByDescending(enrollment => enrollment.StartedAt)
            .ThenBy(enrollment => enrollment.Id)
            .Select(enrollment => new BeerListEnrollmentSummary
            {
                EnrollmentId = enrollment.Id,
                PersonId = enrollment.PersonId,
                FirstName = enrollment.Person!.FirstName,
                LastName = enrollment.Person!.LastName,
                StartedAt = enrollment.StartedAt,
                EndedAt = enrollment.EndedAt,
                EndedBy =
                    enrollment.EndedBy == null
                        ? null
                        : new BeerListPerson
                        {
                            PersonId = enrollment.EndedBy.Id,
                            FirstName = enrollment.EndedBy.FirstName,
                            LastName = enrollment.EndedBy.LastName,
                        },
            })
            .ToListAsync(ct);

    private async Task<IReadOnlyList<BeerPotDrinkSummary>> ListedDrinksAsync(
        int beerPotId,
        CancellationToken ct
    )
    {
        var stockMovements = BeerPotLedger.StockMovements(_dbContext);
        var takenCrates = BeerPotLedger.TakenCrates(_dbContext);

        return await _dbContext
            .BeerPotDrinks.AsNoTracking()
            .Where(potDrink => potDrink.BeerPotId == beerPotId && potDrink.RetiredAt == null)
            .OrderBy(potDrink => EF.Functions.Collate(potDrink.Drink!.Name, GermanCollation.Name))
            .ThenBy(potDrink => potDrink.BeerDrinkId)
            .Select(potDrink => new BeerPotDrinkSummary
            {
                BeerDrinkId = potDrink.BeerDrinkId,
                Name = potDrink.Drink!.Name,
                CratePriceCents = potDrink.CratePriceCents,
                IsDefault = potDrink.IsDefault,
                HasStock =
                    stockMovements
                        .Where(movement =>
                            movement.BeerPotId == beerPotId
                            && movement.BeerDrinkId == potDrink.BeerDrinkId
                        )
                        .Sum(movement => movement.Crates)
                    > takenCrates.Count(crate =>
                        crate.BeerPotId == beerPotId && crate.BeerDrinkId == potDrink.BeerDrinkId
                    ),
            })
            .ToListAsync(ct);
    }

    private async Task<bool> EndRunningAsync(
        IQueryable<BeerListEnrollment> enrollments,
        int? endedByPersonId,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var ended = await enrollments
            .Where(row => row.EndedAt == null)
            .ExecuteUpdateAsync(
                row =>
                    row.SetProperty(enrollment => enrollment.EndedAt, now)
                        .SetProperty(enrollment => enrollment.EndedByPersonId, endedByPersonId)
                        .SetProperty(enrollment => enrollment.UpdatedAt, now),
                ct
            );

        return ended > 0;
    }

    private Task<bool> IsEnrolledAsync(int personId, CancellationToken ct) =>
        _dbContext
            .BeerListEnrollments.AsNoTracking()
            .AnyAsync(row => row.PersonId == personId && row.EndedAt == null, ct);

    private Task<bool> PersonExistsAsync(int personId, CancellationToken ct) =>
        _dbContext.People.AsNoTracking().AnyAsync(person => person.Id == personId, ct);

    private Task<bool> MayManageAsync(int personId, CancellationToken ct) =>
        PermissionHolderQuery
            .PersonIdsHolding(
                _dbContext,
                FurriaPermissions.BeerListManage,
                ClubClock.Today(_timeProvider)
            )
            .AnyAsync(holderId => holderId == personId, ct);

    private sealed record OpenPotRow(
        int BeerPotId,
        BeerListPerson? Owner,
        string? PaymentLink,
        DateTimeOffset OpenedAt
    );
}
