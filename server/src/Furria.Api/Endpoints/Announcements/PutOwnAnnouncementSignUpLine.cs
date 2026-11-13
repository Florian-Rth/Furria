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

public sealed class PutOwnAnnouncementSignUpLine : Endpoint<PutOwnAnnouncementSignUpLineRequest>
{
    private readonly CalendarService _calendarService;

    public PutOwnAnnouncementSignUpLine(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Put("announcements/sign-up-lists/{signUpListId}/my-line");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(
        PutOwnAnnouncementSignUpLineRequest req,
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

    private static WriteOwnSignUpLineCommand ToCommand(
        PutOwnAnnouncementSignUpLineRequest req,
        int actorAccountId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            Host = AddOnHostKind.Announcement,
            SignUpListId = req.SignUpListId,
            Text = req.Text,
        };
}

public sealed record PutOwnAnnouncementSignUpLineRequest
{
    [RouteParam]
    public required int SignUpListId { get; init; }

    public required string? Text { get; init; }
}

public sealed class PutOwnAnnouncementSignUpLineValidator
    : Validator<PutOwnAnnouncementSignUpLineRequest>
{
    private const string TextTooLongMessage = "Ein Eintrag hat höchstens 120 Zeichen.";

    public PutOwnAnnouncementSignUpLineValidator()
    {
        RuleFor(request => request.SignUpListId).GreaterThan(0);
        RuleFor(request => request.Text)
            .Must(text => text is null || text.Trim().Length <= CalendarLimits.SignUpLineTextLength)
            .WithMessage(TextTooLongMessage);
    }
}
