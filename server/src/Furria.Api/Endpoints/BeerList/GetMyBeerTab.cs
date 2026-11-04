using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetMyBeerTab : EndpointWithoutRequest<GetMyBeerTabResponse>
{
    private readonly BeerTabService _beerTabService;
    private readonly PermissionAuthorizer _authorizer;

    public GetMyBeerTab(BeerTabService beerTabService, PermissionAuthorizer authorizer)
    {
        _beerTabService = beerTabService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("beer-list/tab");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await MaySeeHerTabAsync(accountId.Value, personId.Value, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var tab = await _beerTabService.GetTabAsync(personId.Value, ct);
        await Send.OkAsync(
            new GetMyBeerTabResponse { Pots = [.. tab.Pots.Select(ToDto)] },
            cancellation: ct
        );
    }

    private async Task<bool> MaySeeHerTabAsync(int accountId, int personId, CancellationToken ct) =>
        await _authorizer.IsGrantedAnyAsync(accountId, BeerListKeys.Readers, ct)
        || await _beerTabService.HasOpenCratesAsync(personId, ct);

    private static BeerTabPotDto ToDto(BeerTabPotDetails pot) =>
        new()
        {
            BeerPotId = pot.BeerPotId,
            IsOpen = pot.IsOpen,
            OpenedAt = pot.OpenedAt,
            Owner = pot.Owner is { } owner ? ToDto(owner) : null,
            PaymentLink = pot.PaymentLink,
            PaymentNote = pot.PaymentNote,
            OpenCrates = pot.OpenCrates,
            OpenCents = pot.OpenCents,
            PaidCrates = pot.PaidCrates,
            PaidCents = pot.PaidCents,
            Crates = [.. pot.Crates.Select(ToDto)],
        };

    private static BeerTabCrateDto ToDto(BeerTabCrateSummary crate) =>
        new()
        {
            CrateId = crate.CrateId,
            PriceCents = crate.PriceCents,
            BookedAt = crate.BookedAt,
            EnteredBy = crate.EnteredBy is { } enteredBy ? ToDto(enteredBy) : null,
            PaidAt = crate.PaidAt,
        };

    private static BeerTabPersonDto ToDto(BeerListPerson person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };
}

public sealed record GetMyBeerTabResponse
{
    public required IReadOnlyList<BeerTabPotDto> Pots { get; init; }
}

public sealed record BeerTabPotDto
{
    public required int BeerPotId { get; init; }

    public required bool IsOpen { get; init; }

    public required DateTimeOffset OpenedAt { get; init; }

    public required BeerTabPersonDto? Owner { get; init; }

    public required string? PaymentLink { get; init; }

    public required string? PaymentNote { get; init; }

    public required int OpenCrates { get; init; }

    public required int OpenCents { get; init; }

    public required int PaidCrates { get; init; }

    public required int PaidCents { get; init; }

    public required IReadOnlyList<BeerTabCrateDto> Crates { get; init; }
}

public sealed record BeerTabCrateDto
{
    public required int CrateId { get; init; }

    public required int PriceCents { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerTabPersonDto? EnteredBy { get; init; }

    public required DateTimeOffset? PaidAt { get; init; }
}

public sealed record BeerTabPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
