using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class GetBeerTabs : Endpoint<GetBeerTabsRequest, GetBeerTabsResponse>
{
    private readonly BeerPaymentService _beerPaymentService;

    public GetBeerTabs(BeerPaymentService beerPaymentService)
    {
        _beerPaymentService = beerPaymentService;
    }

    public override void Configure()
    {
        Get("beer-list/pots/{beerPotId}/tabs");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(GetBeerTabsRequest req, CancellationToken ct)
    {
        var result = await _beerPaymentService.GetTabsAsync(req.BeerPotId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetBeerTabsResponse { Tabs = [.. result.Value.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static BeerPotTabDto ToDto(BeerPotTabSummary tab) =>
        new()
        {
            Person = ToDto(tab.Person),
            IsEnrolled = tab.IsEnrolled,
            OpenCrates = tab.OpenCrates,
            OpenCents = tab.OpenCents,
            PaidCrates = tab.PaidCrates,
            PaidCents = tab.PaidCents,
            OldestOpenBookedAt = tab.OldestOpenBookedAt,
            Payments = [.. tab.Payments.Select(ToDto)],
        };

    private static BeerPotTabPaymentDto ToDto(BeerPaymentSummary payment) =>
        new()
        {
            BeerPaymentId = payment.BeerPaymentId,
            Crates = payment.Crates,
            AmountCents = payment.AmountCents,
            BookedAt = payment.BookedAt,
            BookedBy = payment.BookedBy is { } bookedBy ? ToDto(bookedBy) : null,
        };

    private static BeerPotTabPersonDto ToDto(BeerListPerson person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };
}

public sealed record GetBeerTabsRequest
{
    [RouteParam]
    public required int BeerPotId { get; init; }
}

public sealed class GetBeerTabsValidator : Validator<GetBeerTabsRequest>
{
    public GetBeerTabsValidator()
    {
        RuleFor(request => request.BeerPotId).GreaterThan(0);
    }
}

public sealed record GetBeerTabsResponse
{
    public required IReadOnlyList<BeerPotTabDto> Tabs { get; init; }
}

public sealed record BeerPotTabDto
{
    public required BeerPotTabPersonDto Person { get; init; }

    public required bool IsEnrolled { get; init; }

    public required int OpenCrates { get; init; }

    public required int OpenCents { get; init; }

    public required int PaidCrates { get; init; }

    public required int PaidCents { get; init; }

    public required DateTimeOffset? OldestOpenBookedAt { get; init; }

    public required IReadOnlyList<BeerPotTabPaymentDto> Payments { get; init; }
}

public sealed record BeerPotTabPaymentDto
{
    public required int BeerPaymentId { get; init; }

    public required int Crates { get; init; }

    public required int AmountCents { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerPotTabPersonDto? BookedBy { get; init; }
}

public sealed record BeerPotTabPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
