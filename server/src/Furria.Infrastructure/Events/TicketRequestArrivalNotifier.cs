using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Application.ClubApp;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Events;

public sealed class TicketRequestArrivalNotifier
{
    private const string OutsideTransactionMessage =
        "An arrival notice is stored in the transaction of the ticket request it reports; "
        + "begin that transaction before submitting.";

    private readonly AppDbContext _dbContext;
    private readonly MailOutbox _mailOutbox;
    private readonly ClubAppOptions _clubAppOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<TicketRequestArrivalNotifier> _logger;

    public TicketRequestArrivalNotifier(
        AppDbContext dbContext,
        MailOutbox mailOutbox,
        IOptions<ClubAppOptions> clubAppOptions,
        TimeProvider timeProvider,
        ILogger<TicketRequestArrivalNotifier> logger
    )
    {
        _dbContext = dbContext;
        _mailOutbox = mailOutbox;
        _clubAppOptions = clubAppOptions.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task NotifyAsync(
        TicketRequest request,
        RequestedEvent requestedEvent,
        string? clubName,
        CancellationToken ct
    )
    {
        if (_dbContext.Database.CurrentTransaction is null)
            throw new InvalidOperationException(OutsideTransactionMessage);

        var handlers = await HandlersAsync(ct);
        var link = TicketRequestArrivalMail.LinkOf(_clubAppOptions.BaseUrl);

        foreach (var handler in handlers)
            _mailOutbox.Stage(
                TicketRequestArrivalMail.Compose(
                    ToMailContent(handler, request, requestedEvent, clubName, link)
                )
            );
        await _dbContext.SaveChangesAsync(ct);

        LogNotices(request.Id, handlers.Count);
    }

    private void LogNotices(int ticketRequestId, int noticeCount)
    {
        if (noticeCount == 0)
            _logger.LogWarning(
                "Ticket request {TicketRequestId} arrived, but nobody who handles ticket requests has an email",
                ticketRequestId
            );
        else
            _logger.LogInformation(
                "Mail {MailTemplate} for ticket request {TicketRequestId} queued for {NoticeCount} persons",
                MailTemplate.TicketRequestArrival,
                ticketRequestId,
                noticeCount
            );
    }

    private async Task<IReadOnlyList<Handler>> HandlersAsync(CancellationToken ct)
    {
        var holderIds = PermissionHolderQuery.PersonIdsHolding(
            _dbContext,
            FurriaPermissions.TicketRequestsHandle,
            ClubClock.Today(_timeProvider)
        );

        return await _dbContext
            .People.AsNoTracking()
            .Where(person =>
                holderIds.Contains(person.Id) && person.Email != null && person.Email != ""
            )
            .OrderBy(person => person.Id)
            .Select(person => new Handler(person.Id, person.FirstName, person.Email!))
            .ToListAsync(ct);
    }

    [Pure]
    private static TicketRequestArrivalMailContent ToMailContent(
        Handler handler,
        TicketRequest request,
        RequestedEvent requestedEvent,
        string? clubName,
        string link
    ) =>
        new()
        {
            PersonId = handler.PersonId,
            To = handler.Email,
            FirstName = handler.FirstName,
            GuestName = request.Name,
            EventTitle = requestedEvent.Title,
            EventStartsAt = requestedEvent.StartsAt,
            TicketCount = request.TicketCount,
            ClubName = clubName,
            Link = link,
        };

    private sealed record Handler(int PersonId, string FirstName, string Email);
}
