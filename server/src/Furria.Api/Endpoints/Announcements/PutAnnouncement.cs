using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Calendar;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class PutAnnouncement : Endpoint<PutAnnouncementRequest>
{
    private readonly AnnouncementService _announcementService;
    private readonly PermissionAuthorizer _authorizer;

    public PutAnnouncement(AnnouncementService announcementService, PermissionAuthorizer authorizer)
    {
        _announcementService = announcementService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("announcements/{announcementId}");
    }

    public override async Task HandleAsync(PutAnnouncementRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var mayPost = await _authorizer.IsGrantedAsync(
            accountId.Value,
            FurriaPermissions.AnnouncementsPost,
            ct
        );

        var result = await _announcementService.UpdateAsync(
            ToCommand(req, personId.Value, mayPost),
            ct
        );

        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateAnnouncementCommand ToCommand(
        PutAnnouncementRequest req,
        int actorPersonId,
        bool actorMayPostAnnouncements
    ) =>
        new()
        {
            AnnouncementId = req.AnnouncementId,
            Title = req.Title,
            Body = req.Body,
            ValidUntil = req.ValidUntil,
            AddOns = [.. req.AddOns.Select(ToInput)],
            ActorPersonId = actorPersonId,
            ActorMayPostAnnouncements = actorMayPostAnnouncements,
        };

    private static AnnouncementAddOnInput ToInput(PutAnnouncementAddOnDataDto addOn) =>
        new()
        {
            Kind = addOn.Kind,
            Attendance = addOn.Attendance is { } attendance
                ? new AnnouncementAttendanceInput { AnswersUntil = attendance.AnswersUntil }
                : null,
            Poll = addOn.Poll is { } poll ? ToInput(poll) : null,
            SignUpList = addOn.SignUpList is { } list ? ToInput(list) : null,
        };

    private static SignUpListInput ToInput(PutAnnouncementSignUpListDataDto list) =>
        new()
        {
            SignUpListId = list.SignUpListId,
            Title = list.Title,
            Hint = list.Hint,
            SignUpUntil = list.SignUpUntil,
        };

    private static PollInput ToInput(PutAnnouncementPollDataDto poll) =>
        new()
        {
            PollId = poll.PollId,
            Question = poll.Question,
            AllowsMultipleChoices = poll.AllowsMultipleChoices,
            IsAnonymous = poll.IsAnonymous,
            VotesUntil = poll.VotesUntil,
            Options = [.. poll.Options.Select(ToInput)],
        };

    private static PollOptionInput ToInput(PutAnnouncementPollOptionDataDto option) =>
        new() { OptionId = option.OptionId, Label = option.Label };
}

public sealed record PutAnnouncementRequest
{
    [RouteParam]
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required IReadOnlyList<PutAnnouncementAddOnDataDto> AddOns { get; init; }
}

public sealed class PutAnnouncementValidator : Validator<PutAnnouncementRequest>
{
    private const string AddOnTwiceMessage =
        "Ein Aushang trägt höchstens eine Zu-/Absage und jede Funktion nur einmal.";
    private const string TooManyAddOnsMessage = "Ein Aushang trägt höchstens 30 Funktionen.";

    public PutAnnouncementValidator()
    {
        RuleFor(request => request.AnnouncementId).GreaterThan(0);
        RuleFor(request => request.Title).NotEmpty().MaximumLength(AnnouncementLimits.TitleLength);
        RuleFor(request => request.Body).NotEmpty().MaximumLength(AnnouncementLimits.BodyLength);
        RuleFor(request => request.AddOns).NotNull();
        RuleFor(request => request.AddOns.Count)
            .LessThanOrEqualTo(CalendarLimits.MaxAddOns)
            .When(request => request.AddOns is not null)
            .WithMessage(TooManyAddOnsMessage);
        RuleForEach(request => request.AddOns)
            .NotNull()
            .SetValidator(new PutAnnouncementAddOnDataValidator());
        RuleFor(request => request.AddOns)
            .Must(EachAddOnOnce)
            .When(request => request.AddOns is not null)
            .WithMessage(AddOnTwiceMessage);
    }

    [Pure]
    private static bool EachAddOnOnce(IReadOnlyList<PutAnnouncementAddOnDataDto> addOns)
    {
        var attendanceCount = addOns.Count(addOn =>
            addOn?.Kind == AnnouncementAddOnKind.Attendance
        );
        var pollIds = addOns.Select(addOn => addOn?.Poll?.PollId).OfType<int>().ToList();
        var signUpListIds = addOns
            .Select(addOn => addOn?.SignUpList?.SignUpListId)
            .OfType<int>()
            .ToList();

        return attendanceCount <= 1
            && pollIds.Distinct().Count() == pollIds.Count
            && signUpListIds.Distinct().Count() == signUpListIds.Count;
    }
}

public sealed record PutAnnouncementAddOnDataDto
{
    public required AnnouncementAddOnKind Kind { get; init; }

    public required PutAnnouncementAttendanceDataDto? Attendance { get; init; }

    public required PutAnnouncementPollDataDto? Poll { get; init; }

    public required PutAnnouncementSignUpListDataDto? SignUpList { get; init; }
}

public sealed record PutAnnouncementAttendanceDataDto
{
    public required DateTimeOffset? AnswersUntil { get; init; }
}

public sealed record PutAnnouncementSignUpListDataDto
{
    public required int? SignUpListId { get; init; }

    public required string Title { get; init; }

    public required string? Hint { get; init; }

    public required DateTimeOffset? SignUpUntil { get; init; }
}

public sealed record PutAnnouncementPollDataDto
{
    public required int? PollId { get; init; }

    public required string Question { get; init; }

    public required bool AllowsMultipleChoices { get; init; }

    public required bool IsAnonymous { get; init; }

    public required DateTimeOffset? VotesUntil { get; init; }

    public required IReadOnlyList<PutAnnouncementPollOptionDataDto> Options { get; init; }
}

public sealed record PutAnnouncementPollOptionDataDto
{
    public required int? OptionId { get; init; }

    public required string Label { get; init; }
}

public sealed class PutAnnouncementAddOnDataValidator
    : AbstractValidator<PutAnnouncementAddOnDataDto>
{
    private const string UnknownAddOnMessage = "Diese Funktion gibt es nicht.";
    private const string AttendanceWithoutDataMessage = "Die Zu-/Absage braucht ihre Angaben.";
    private const string AttendanceOutsideAttendanceMessage =
        "Nur eine Zu-/Absage trägt eine Antwortfrist.";
    private const string PollWithoutQuestionMessage = "Die Umfrage braucht eine Frage.";
    private const string PollOutsideAPollMessage = "Nur eine Umfrage trägt Fragen und Antworten.";
    private const string SignUpListWithoutTitleMessage = "Die Eintragsliste braucht einen Titel.";
    private const string SignUpListOutsideAListMessage =
        "Nur eine Eintragsliste trägt Titel und Hinweis.";

    public PutAnnouncementAddOnDataValidator()
    {
        RuleFor(addOn => addOn.Kind).IsInEnum().WithMessage(UnknownAddOnMessage);
        RuleFor(addOn => addOn.Attendance)
            .NotNull()
            .When(addOn => addOn.Kind == AnnouncementAddOnKind.Attendance)
            .WithMessage(AttendanceWithoutDataMessage);
        RuleFor(addOn => addOn.Attendance)
            .Null()
            .When(addOn => addOn.Kind != AnnouncementAddOnKind.Attendance)
            .WithMessage(AttendanceOutsideAttendanceMessage);
        RuleFor(addOn => addOn.Poll)
            .NotNull()
            .When(addOn => addOn.Kind == AnnouncementAddOnKind.Poll)
            .WithMessage(PollWithoutQuestionMessage);
        RuleFor(addOn => addOn.Poll)
            .Null()
            .When(addOn => addOn.Kind != AnnouncementAddOnKind.Poll)
            .WithMessage(PollOutsideAPollMessage);
        RuleFor(addOn => addOn.Poll!)
            .SetValidator(new PutAnnouncementPollDataValidator())
            .When(addOn => addOn.Poll is not null);
        RuleFor(addOn => addOn.SignUpList)
            .NotNull()
            .When(addOn => addOn.Kind == AnnouncementAddOnKind.SignUpList)
            .WithMessage(SignUpListWithoutTitleMessage);
        RuleFor(addOn => addOn.SignUpList)
            .Null()
            .When(addOn => addOn.Kind != AnnouncementAddOnKind.SignUpList)
            .WithMessage(SignUpListOutsideAListMessage);
        RuleFor(addOn => addOn.SignUpList!)
            .SetValidator(new PutAnnouncementSignUpListDataValidator())
            .When(addOn => addOn.SignUpList is not null);
    }
}

public sealed class PutAnnouncementSignUpListDataValidator
    : AbstractValidator<PutAnnouncementSignUpListDataDto>
{
    private const string UnknownSignUpListMessage = "Diese Eintragsliste gibt es nicht.";
    private const string TitleMissingMessage = "Die Eintragsliste braucht einen Titel.";
    private const string TitleTooLongMessage = "Ein Listentitel hat höchstens 120 Zeichen.";
    private const string HintTooLongMessage = "Ein Hinweis hat höchstens 300 Zeichen.";

    public PutAnnouncementSignUpListDataValidator()
    {
        RuleFor(list => list.SignUpListId)
            .GreaterThan(0)
            .When(list => list.SignUpListId is not null)
            .WithMessage(UnknownSignUpListMessage);
        RuleFor(list => list.Title)
            .Cascade(CascadeMode.Stop)
            .Must(title => !string.IsNullOrWhiteSpace(title))
            .WithMessage(TitleMissingMessage)
            .Must(title => title.Trim().Length <= CalendarLimits.SignUpListTitleLength)
            .WithMessage(TitleTooLongMessage);
        RuleFor(list => list.Hint)
            .Must(hint => hint is null || hint.Trim().Length <= CalendarLimits.SignUpListHintLength)
            .WithMessage(HintTooLongMessage);
    }
}

public sealed class PutAnnouncementPollDataValidator : AbstractValidator<PutAnnouncementPollDataDto>
{
    private const string UnknownPollMessage = "Diese Umfrage gibt es nicht.";
    private const string UnknownOptionMessage = "Diese Antwort gibt es nicht.";
    private const string QuestionMissingMessage = "Die Umfrage braucht eine Frage.";
    private const string QuestionTooLongMessage = "Eine Frage hat höchstens 200 Zeichen.";
    private const string LabelMissingMessage = "Jede Antwort braucht einen Text.";
    private const string LabelTooLongMessage = "Eine Antwort hat höchstens 120 Zeichen.";
    private const string OptionCountMessage = "Eine Umfrage hat 2 bis 20 Antworten.";
    private const string LabelTwiceMessage = "Jede Antwort kann nur einmal vorkommen.";

    public PutAnnouncementPollDataValidator()
    {
        RuleFor(poll => poll.PollId)
            .GreaterThan(0)
            .When(poll => poll.PollId is not null)
            .WithMessage(UnknownPollMessage);
        RuleFor(poll => poll.Question)
            .Cascade(CascadeMode.Stop)
            .Must(question => !string.IsNullOrWhiteSpace(question))
            .WithMessage(QuestionMissingMessage)
            .MaximumLength(CalendarLimits.PollQuestionLength)
            .WithMessage(QuestionTooLongMessage);
        RuleFor(poll => poll.Options).NotNull();
        RuleFor(poll => poll.Options.Count)
            .InclusiveBetween(CalendarLimits.PollMinOptions, CalendarLimits.PollMaxOptions)
            .When(poll => poll.Options is not null)
            .WithMessage(OptionCountMessage);
        RuleForEach(poll => poll.Options)
            .Cascade(CascadeMode.Stop)
            .Must(option => option is not null && !string.IsNullOrWhiteSpace(option.Label))
            .WithMessage(LabelMissingMessage)
            .Must(option => option.Label.Length <= CalendarLimits.PollOptionLabelLength)
            .WithMessage(LabelTooLongMessage)
            .Must(option => option.OptionId is not { } optionId || optionId > 0)
            .WithMessage(UnknownOptionMessage);
        RuleFor(poll => poll.Options)
            .Must(EachLabelOnce)
            .When(poll => poll.Options is not null && poll.Options.All(HasLabel))
            .WithMessage(LabelTwiceMessage);
        RuleFor(poll => poll.Options)
            .Must(EachOptionOnce)
            .When(poll => poll.Options is not null && poll.Options.All(HasLabel))
            .WithMessage(UnknownOptionMessage);
        RuleFor(poll => poll.Options)
            .Must(options => options.All(option => option.OptionId is null))
            .When(poll =>
                poll.PollId is null && poll.Options is not null && poll.Options.All(HasLabel)
            )
            .WithMessage(UnknownOptionMessage);
    }

    [Pure]
    private static bool HasLabel(PutAnnouncementPollOptionDataDto? option) =>
        option?.Label is not null;

    [Pure]
    private static bool EachLabelOnce(IReadOnlyList<PutAnnouncementPollOptionDataDto> options) =>
        options
            .Select(option => option.Label.Trim().ToLowerInvariant())
            .Distinct(StringComparer.Ordinal)
            .Count() == options.Count;

    [Pure]
    private static bool EachOptionOnce(IReadOnlyList<PutAnnouncementPollOptionDataDto> options)
    {
        var held = options.Select(option => option.OptionId).OfType<int>().ToList();
        return held.Distinct().Count() == held.Count;
    }
}
