using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class CloseAnnouncementPoll : Endpoint<CloseAnnouncementPollRequest>
{
    private readonly CalendarService _calendarService;

    public CloseAnnouncementPoll(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("announcements/polls/{pollId}/close");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(CloseAnnouncementPollRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.ClosePollAsync(
            accountId.Value,
            req.PollId,
            AddOnHostKind.Announcement,
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

public sealed record CloseAnnouncementPollRequest
{
    [RouteParam]
    public required int PollId { get; init; }
}

public sealed class CloseAnnouncementPollValidator : Validator<CloseAnnouncementPollRequest>
{
    public CloseAnnouncementPollValidator()
    {
        RuleFor(request => request.PollId).GreaterThan(0);
    }
}
