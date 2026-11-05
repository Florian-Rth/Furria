using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetBeerPotJournal
    : Endpoint<GetBeerPotJournalRequest, GetBeerPotJournalResponse>
{
    private readonly BeerJournalService _beerJournalService;

    public GetBeerPotJournal(BeerJournalService beerJournalService)
    {
        _beerJournalService = beerJournalService;
    }

    public override void Configure()
    {
        Get("beer-list/pots/{beerPotId}/journal");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(GetBeerPotJournalRequest req, CancellationToken ct)
    {
        var result = await _beerJournalService.GetJournalAsync(req.BeerPotId, ct);

        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetBeerPotJournalResponse
            {
                Crates = [.. result.Value.Crates.Select(ToDto)],
                Payments = [.. result.Value.Payments.Select(ToDto)],
            },
            cancellation: ct
        );
    }

    private static BeerJournalCrateDto ToDto(BeerJournalCrateSummary crate) =>
        new()
        {
            CrateId = crate.CrateId,
            Person = crate.Person is { } person ? ToDto(person) : null,
            PriceCents = crate.PriceCents,
            BookedAt = crate.BookedAt,
            EnteredBy = crate.EnteredBy is { } enteredBy ? ToDto(enteredBy) : null,
            UndoneAt = crate.UndoneAt,
            BeerPaymentId = crate.BeerPaymentId,
        };

    private static BeerJournalPaymentDto ToDto(BeerJournalPaymentSummary payment) =>
        new()
        {
            BeerPaymentId = payment.BeerPaymentId,
            Person = payment.Person is { } person ? ToDto(person) : null,
            Crates = payment.Crates,
            AmountCents = payment.AmountCents,
            BookedAt = payment.BookedAt,
            BookedBy = payment.BookedBy is { } bookedBy ? ToDto(bookedBy) : null,
            UndoneAt = payment.UndoneAt,
        };

    private static BeerJournalPersonDto ToDto(BeerListPerson person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };
}

public sealed record GetBeerPotJournalRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }
}

public sealed class GetBeerPotJournalValidator : Validator<GetBeerPotJournalRequest>
{
    public GetBeerPotJournalValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
    }
}

public sealed record GetBeerPotJournalResponse
{
    public required IReadOnlyList<BeerJournalCrateDto> Crates { get; init; }

    public required IReadOnlyList<BeerJournalPaymentDto> Payments { get; init; }
}

public sealed record BeerJournalCrateDto
{
    public required int CrateId { get; init; }

    public required BeerJournalPersonDto? Person { get; init; }

    public required int PriceCents { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerJournalPersonDto? EnteredBy { get; init; }

    public required DateTimeOffset? UndoneAt { get; init; }

    public required int? BeerPaymentId { get; init; }
}

public sealed record BeerJournalPaymentDto
{
    public required int BeerPaymentId { get; init; }

    public required BeerJournalPersonDto? Person { get; init; }

    public required int Crates { get; init; }

    public required int AmountCents { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerJournalPersonDto? BookedBy { get; init; }

    public required DateTimeOffset? UndoneAt { get; init; }
}

public sealed record BeerJournalPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
