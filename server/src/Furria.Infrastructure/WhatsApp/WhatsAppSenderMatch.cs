using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppSenderMatch
{
    private readonly AppDbContext _dbContext;
    private readonly WahaClient _waha;

    public WhatsAppSenderMatch(AppDbContext dbContext, WahaClient waha)
    {
        _dbContext = dbContext;
        _waha = waha;
    }

    public async Task<WhatsAppSender> MatchAsync(string senderId, CancellationToken ct)
    {
        if (await PhoneDigitsOfAsync(senderId, ct) is not { } digits)
            return new WhatsAppSender(null, null);

        var people = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.Phone != null && person.ArchivedOn == null)
            .Select(person => new WhatsAppPersonPhone(person.Id, person.Phone ?? ""))
            .ToListAsync(ct);

        return new WhatsAppSender(digits, WhatsAppSenders.PersonIdOf(digits, people));
    }

    public async Task<string?> NameOfAsync(
        string senderId,
        WhatsAppSender sender,
        CancellationToken ct
    ) =>
        (
            await WahaReach.TryAsync(
                () =>
                    _waha.ContactNameAsync(
                        sender.PhoneDigits is { } digits
                            ? digits + WhatsAppSenders.PhoneServer
                            : senderId,
                        ct
                    ),
                ct
            )
        )?.Value;

    public async Task<string?> PhoneDigitsOfAsync(string senderId, CancellationToken ct) =>
        WhatsAppSenders.IsLinkedId(senderId)
            ? await _waha.PhoneIdOfLidAsync(senderId, ct) is { } phoneId
                ? WhatsAppSenders.PhoneDigitsOf(phoneId)
                : null
            : WhatsAppSenders.PhoneDigitsOf(senderId);
}
