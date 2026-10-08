using System.Diagnostics.Contracts;
using Furria.Application.Events;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Events;

public sealed class TicketRequestService
{
    private const string UnknownEventMessage = "Diese Veranstaltung gibt es nicht.";
    private const string WindowClosedMessage =
        "Für diese Veranstaltung nehmen wir gerade keine Kartenanfragen an.";
    private const string AlreadyHandledMessage = "Diese Kartenanfrage ist schon erledigt.";

    private readonly AppDbContext _dbContext;
    private readonly MailOutbox _mailOutbox;
    private readonly TicketRequestArrivalNotifier _arrivalNotifier;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<TicketRequestService> _logger;

    public TicketRequestService(
        AppDbContext dbContext,
        MailOutbox mailOutbox,
        TicketRequestArrivalNotifier arrivalNotifier,
        TimeProvider timeProvider,
        ILogger<TicketRequestService> logger
    )
    {
        _dbContext = dbContext;
        _mailOutbox = mailOutbox;
        _arrivalNotifier = arrivalNotifier;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<Result> SubmitAsync(SubmitTicketRequestCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var held = await RequestableEventAsync(command.EventId, ct);

        if (held is null)
            return Result.NotFound(UnknownEventMessage);

        if (!TicketRequestWindow.IsOpen(held.StatusAt(now), held.StartsAt, now))
            return Result.Conflict(WindowClosedMessage);

        var request = ToTicketRequest(command, now);
        var requestedEvent = new RequestedEvent(held.Title, held.StartsAt);
        var clubName = await ClubNameAsync(ct);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        _dbContext.TicketRequests.Add(request);
        await _dbContext.SaveChangesAsync(ct);
        _mailOutbox.Stage(
            TicketRequestReceiptMail.Compose(ToReceiptContent(request, requestedEvent, clubName))
        );
        await _arrivalNotifier.NotifyAsync(request, requestedEvent, clubName, ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation(
            "Ticket request {TicketRequestId} for event {EventId} submitted",
            request.Id,
            request.EventId
        );

        return Result.Success();
    }

    public async Task<IReadOnlyList<TicketRequestSummary>> GetOpenAsync(CancellationToken ct) =>
        await _dbContext
            .TicketRequests.AsNoTracking()
            .OrderBy(request => request.Event!.CalendarEntry!.StartsAt)
            .ThenBy(request => request.EventId)
            .ThenBy(request => request.RequestedAt)
            .ThenBy(request => request.Id)
            .Select(request => new TicketRequestSummary
            {
                TicketRequestId = request.Id,
                EventId = request.EventId,
                EventTitle = request.Event!.CalendarEntry!.Title,
                EventStartsAt = request.Event.CalendarEntry.StartsAt,
                TicketCount = request.TicketCount,
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                Message = request.Message,
                RequestedAt = request.RequestedAt,
            })
            .ToListAsync(ct);

    public async Task<Result> HandleAsync(int ticketRequestId, CancellationToken ct)
    {
        var deleted = await _dbContext
            .TicketRequests.Where(request => request.Id == ticketRequestId)
            .ExecuteDeleteAsync(ct);

        if (deleted == 0)
            return Result.NotFound(AlreadyHandledMessage);

        _logger.LogInformation("Ticket request {TicketRequestId} handled", ticketRequestId);

        return Result.Success();
    }

    public async Task DeleteOfPastEventsAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var todayBegan = ClubClock.StartOfDay(ClubClock.Today(_timeProvider));
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        var deleted = await _dbContext
            .TicketRequests.Where(request =>
                request.Event!.CalendarEntry!.StartsAt < todayBegan
                && (
                    request.Event.CalendarEntry.EndsAt == null
                        ? request.Event.CalendarEntry.StartsAt <= openEndedCutoff
                        : request.Event.CalendarEntry.EndsAt <= now
                )
            )
            .ExecuteDeleteAsync(ct);

        if (deleted > 0)
            _logger.LogInformation(
                "{TicketRequestCount} ticket requests of past events deleted",
                deleted
            );
    }

    private Task<RequestableEvent?> RequestableEventAsync(int eventId, CancellationToken ct) =>
        _dbContext
            .Events.AsNoTracking()
            .Where(row => row.CalendarEntryId == eventId)
            .Select(row => new RequestableEvent(
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt,
                row.PresaleStartsAt,
                row.TicketAvailability,
                row.CancelledAt
            ))
            .SingleOrDefaultAsync(ct);

    private Task<string?> ClubNameAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => row.Name)
            .SingleOrDefaultAsync(ct);

    [Pure]
    private static TicketRequest ToTicketRequest(
        SubmitTicketRequestCommand command,
        DateTimeOffset requestedAt
    ) =>
        new()
        {
            EventId = command.EventId,
            TicketCount = command.TicketCount,
            Name = command.Name.Trim(),
            Phone = command.Phone.Trim(),
            Email = command.Email.Trim(),
            Message = string.IsNullOrWhiteSpace(command.Message) ? null : command.Message.Trim(),
            RequestedAt = requestedAt,
        };

    [Pure]
    private static TicketRequestReceiptMailContent ToReceiptContent(
        TicketRequest request,
        RequestedEvent requestedEvent,
        string? clubName
    ) =>
        new()
        {
            TicketRequestId = request.Id,
            To = request.Email,
            EventTitle = requestedEvent.Title,
            EventStartsAt = requestedEvent.StartsAt,
            TicketCount = request.TicketCount,
            ClubName = clubName,
        };

    private sealed record RequestableEvent(
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? PresaleStartsAt,
        TicketAvailability TicketAvailability,
        DateTimeOffset? CancelledAt
    )
    {
        [Pure]
        public EventSalesStatus StatusAt(DateTimeOffset now) =>
            EventSales.StatusOf(PresaleStartsAt, TicketAvailability, CancelledAt is not null, now);
    }
}
