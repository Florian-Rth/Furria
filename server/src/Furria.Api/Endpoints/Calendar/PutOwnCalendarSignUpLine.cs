using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PutOwnCalendarSignUpLine : Endpoint<PutOwnCalendarSignUpLineRequest>
{
    private readonly CalendarService _calendarService;

    public PutOwnCalendarSignUpLine(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Put("calendar/sign-up-lists/{signUpListId}/my-line");
    }

    public override async Task HandleAsync(
        PutOwnCalendarSignUpLineRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.WriteOwnSignUpLineAsync(
            ToCommand(req, accountId.Value),
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static WriteOwnCalendarSignUpLineCommand ToCommand(
        PutOwnCalendarSignUpLineRequest req,
        int actorAccountId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            SignUpListId = req.SignUpListId,
            Text = req.Text,
        };
}

public sealed record PutOwnCalendarSignUpLineRequest
{
    [RouteParam]
    public required int SignUpListId { get; init; }

    public required string? Text { get; init; }
}

public sealed class PutOwnCalendarSignUpLineValidator : Validator<PutOwnCalendarSignUpLineRequest>
{
    private const string TextTooLongMessage = "Ein Eintrag hat höchstens 120 Zeichen.";

    public PutOwnCalendarSignUpLineValidator()
    {
        RuleFor(request => request.SignUpListId).GreaterThan(0);
        RuleFor(request => request.Text)
            .Must(text => text is null || text.Trim().Length <= CalendarLimits.SignUpLineTextLength)
            .WithMessage(TextTooLongMessage);
    }
}
