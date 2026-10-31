using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Calendar;

public sealed class GetCalendarEntryRunningOrder
    : Endpoint<GetCalendarEntryRunningOrderRequest, GetCalendarEntryRunningOrderResponse>
{
    private readonly CalendarService _calendarService;
    private readonly RunningOrderService _runningOrderService;

    public GetCalendarEntryRunningOrder(
        CalendarService calendarService,
        RunningOrderService runningOrderService
    )
    {
        _calendarService = calendarService;
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Get("calendar/entries/{calendarEntryId}/running-order");
    }

    public override async Task HandleAsync(
        GetCalendarEntryRunningOrderRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var entry = await _calendarService.GetEntryAsync(accountId.Value, req.CalendarEntryId, ct);
        if (!entry.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(entry.Error, ct);
            return;
        }

        if (User.PersonId() is not { } personId)
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var runningOrder = await _runningOrderService.GetEveningRunningOrderAsync(
            req.CalendarEntryId,
            personId,
            ct
        );

        await Send.OkAsync(ToResponse(runningOrder), cancellation: ct);
    }

    private static GetCalendarEntryRunningOrderResponse ToResponse(
        EveningRunningOrderDetails runningOrder
    ) =>
        new()
        {
            CalendarEntryId = runningOrder.EventId,
            Confirmed = runningOrder.IsConfirmed,
            Lines = [.. runningOrder.Lines.Select(ToDto)],
        };

    private static EveningRunningOrderLineDto ToDto(EveningRunningOrderLineDetails line) =>
        new()
        {
            ActId = line.ActId,
            Name = line.Name,
            Kind = line.Kind,
            Group = ActGroupDto.From(line.Group),
            Position = line.Position,
            Own = line.IsOwn,
        };
}

public sealed record GetCalendarEntryRunningOrderRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }
}

public sealed class GetCalendarEntryRunningOrderValidator
    : Validator<GetCalendarEntryRunningOrderRequest>
{
    public GetCalendarEntryRunningOrderValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
    }
}

public sealed record GetCalendarEntryRunningOrderResponse
{
    public required int CalendarEntryId { get; init; }

    public required bool Confirmed { get; init; }

    public required IReadOnlyList<EveningRunningOrderLineDto> Lines { get; init; }
}

public sealed record EveningRunningOrderLineDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupDto? Group { get; init; }

    public required int Position { get; init; }

    public required bool Own { get; init; }
}
