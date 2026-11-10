using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PutCalendarPollVotes : Endpoint<PutCalendarPollVotesRequest>
{
    private readonly CalendarService _calendarService;

    public PutCalendarPollVotes(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Put("calendar/polls/{pollId}/votes");
    }

    public override async Task HandleAsync(PutCalendarPollVotesRequest req, CancellationToken ct)
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

    private static CastCalendarPollVotesCommand ToCommand(
        PutCalendarPollVotesRequest req,
        int actorAccountId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            PollId = req.PollId,
            OptionIds = [.. req.OptionIds],
        };
}

public sealed record PutCalendarPollVotesRequest
{
    [RouteParam]
    public required int PollId { get; init; }

    public required IReadOnlyList<int> OptionIds { get; init; }
}

public sealed class PutCalendarPollVotesValidator : Validator<PutCalendarPollVotesRequest>
{
    private const string UnknownOptionMessage = "Diese Antwort gibt es nicht.";
    private const string OptionTwiceMessage = "Jede Antwort kann nur einmal gewählt werden.";

    public PutCalendarPollVotesValidator()
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
