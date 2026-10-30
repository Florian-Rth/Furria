using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PutCalendarEntryLive
    : Endpoint<PutCalendarEntryLiveRequest, PutCalendarEntryLiveResponse>
{
    private readonly LiveDirectionService _liveDirectionService;

    public PutCalendarEntryLive(LiveDirectionService liveDirectionService)
    {
        _liveDirectionService = liveDirectionService;
    }

    public override void Configure()
    {
        Put("calendar/entries/{calendarEntryId}/live");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(PutCalendarEntryLiveRequest req, CancellationToken ct)
    {
        var moved = await _liveDirectionService.MoveAsync(
            new MoveLiveCommand
            {
                EventId = req.CalendarEntryId,
                From = req.From,
                To = req.To,
            },
            ct
        );
        if (!moved.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(moved.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PutCalendarEntryLiveResponse
            {
                AppearanceId = moved.Value.AppearanceId,
                StartedAt = moved.Value.StartedAt,
                MovedAt = moved.Value.MovedAt,
            },
            cancellation: ct
        );
    }
}

public sealed record PutCalendarEntryLiveRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }

    public required int? From { get; init; }

    public required int? To { get; init; }
}

public sealed class PutCalendarEntryLiveValidator : Validator<PutCalendarEntryLiveRequest>
{
    public PutCalendarEntryLiveValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.From).GreaterThan(0);
        RuleFor(request => request.To).GreaterThan(0);
        RuleFor(request => request.To)
            .NotEqual(request => request.From)
            .WithMessage("Die Regie bleibt sonst, wo sie ist.");
    }
}

public sealed record PutCalendarEntryLiveResponse
{
    public required int? AppearanceId { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset MovedAt { get; init; }
}
