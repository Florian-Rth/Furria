using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PostCalendarReminder : Endpoint<PostCalendarReminderRequest>
{
    private readonly CalendarService _calendarService;

    public PostCalendarReminder(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("calendar/entries/{calendarEntryId}/reminders");
    }

    public override async Task HandleAsync(PostCalendarReminderRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.RemindAsync(
            new RemindCalendarCommand
            {
                ActorAccountId = accountId.Value,
                CalendarEntryId = req.CalendarEntryId,
                Kind = req.Kind,
                AddOnId = req.AddOnId,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PostCalendarReminderRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }

    public required CalendarEntryAddOnKind Kind { get; init; }

    public int? AddOnId { get; init; }
}

public sealed class PostCalendarReminderValidator : Validator<PostCalendarReminderRequest>
{
    private const string UnremindableMessage = "An diese Funktion lässt sich nicht erinnern.";
    private const string MissingAddOnMessage = "Welche Funktion soll erinnern?";
    private const string StrayAddOnMessage = "Die Zu-/Absage braucht keine weitere Angabe.";

    public PostCalendarReminderValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.Kind)
            .Must(CalendarReminderRules.Reminds)
            .WithMessage(UnremindableMessage);
        RuleFor(request => request.AddOnId)
            .NotNull()
            .When(request => request.Kind != CalendarEntryAddOnKind.Attendance)
            .WithMessage(MissingAddOnMessage);
        RuleFor(request => request.AddOnId)
            .GreaterThan(0)
            .When(request => request.AddOnId is not null);
        RuleFor(request => request.AddOnId)
            .Null()
            .When(request => request.Kind == CalendarEntryAddOnKind.Attendance)
            .WithMessage(StrayAddOnMessage);
    }
}
