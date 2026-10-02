using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PostCalendarResponse : Endpoint<PostCalendarResponseRequest>
{
    private readonly CalendarService _calendarService;
    private readonly PermissionAuthorizer _authorizer;

    public PostCalendarResponse(CalendarService calendarService, PermissionAuthorizer authorizer)
    {
        _calendarService = calendarService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("calendar/{calendarEntryId}/response");
    }

    public override async Task HandleAsync(PostCalendarResponseRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var holdsClubRead = await _authorizer.IsGrantedAsync(
            accountId.Value,
            FurriaPermissions.ClubRead,
            ct
        );
        var result = await _calendarService.SetResponseAsync(
            ToCommand(req, personId.Value, holdsClubRead),
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static SetAttendanceResponseCommand ToCommand(
        PostCalendarResponseRequest req,
        int personId,
        bool holdsClubRead
    ) =>
        new()
        {
            CalendarEntryId = req.CalendarEntryId,
            PersonId = personId,
            Answer = req.Answer,
            HoldsClubRead = holdsClubRead,
        };
}

public sealed record PostCalendarResponseRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}

public sealed class PostCalendarResponseValidator : Validator<PostCalendarResponseRequest>
{
    private const string UnknownAnswerMessage = "Diese Antwort gibt es nicht.";

    public PostCalendarResponseValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.Answer).IsInEnum().WithMessage(UnknownAnswerMessage);
    }
}
