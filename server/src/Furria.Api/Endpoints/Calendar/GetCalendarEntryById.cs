using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class GetCalendarEntryById
    : Endpoint<GetCalendarEntryByIdRequest, GetCalendarEntryByIdResponse>
{
    private readonly CalendarService _calendarService;

    public GetCalendarEntryById(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Get("calendar/entries/{calendarEntryId}");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(GetCalendarEntryByIdRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var entry = await _calendarService.GetEntryAsync(personId.Value, req.CalendarEntryId, ct);
        if (entry is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(new() { Entry = CalendarEntryDto.From(entry) }, cancellation: ct);
    }
}

public sealed record GetCalendarEntryByIdRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }
}

public sealed class GetCalendarEntryByIdValidator : Validator<GetCalendarEntryByIdRequest>
{
    public GetCalendarEntryByIdValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
    }
}

public sealed record GetCalendarEntryByIdResponse
{
    public required CalendarEntryDto Entry { get; init; }
}
