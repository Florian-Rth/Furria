using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Calendar;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class PutAnnouncementPollVotes : Endpoint<PutAnnouncementPollVotesRequest>
{
    private readonly CalendarService _calendarService;

    public PutAnnouncementPollVotes(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Put("announcements/polls/{pollId}/votes");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(
        PutAnnouncementPollVotesRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.CastPollVotesAsync(ToCommand(req, accountId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static CastPollVotesCommand ToCommand(
        PutAnnouncementPollVotesRequest req,
        int actorAccountId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            Host = AddOnHostKind.Announcement,
            PollId = req.PollId,
            OptionIds = [.. req.OptionIds],
        };
}

public sealed record PutAnnouncementPollVotesRequest
{
    [RouteParam]
    public required int PollId { get; init; }

    public required IReadOnlyList<int> OptionIds { get; init; }
}

public sealed class PutAnnouncementPollVotesValidator : Validator<PutAnnouncementPollVotesRequest>
{
    private const string UnknownOptionMessage = "Diese Antwort gibt es nicht.";
    private const string OptionTwiceMessage = "Jede Antwort kann nur einmal gewählt werden.";

    public PutAnnouncementPollVotesValidator()
    {
        RuleFor(request => request.PollId).GreaterThan(0);
        RuleFor(request => request.OptionIds).NotNull();
        RuleFor(request => request.OptionIds.Count)
            .LessThanOrEqualTo(CalendarLimits.PollMaxOptions)
            .When(request => request.OptionIds is not null)
            .WithMessage(UnknownOptionMessage);
        RuleForEach(request => request.OptionIds).GreaterThan(0).WithMessage(UnknownOptionMessage);
        RuleFor(request => request.OptionIds)
            .Must(optionIds => optionIds.Distinct().Count() == optionIds.Count)
            .When(request => request.OptionIds is not null)
            .WithMessage(OptionTwiceMessage);
    }
}
