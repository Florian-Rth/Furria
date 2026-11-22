using Furria.Application.Results;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppGroupService
{
    private const string UnknownGroupMessage = "Der Bot ist nicht in dieser WhatsApp-Gruppe.";

    private readonly AppDbContext _dbContext;
    private readonly WahaClient _waha;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;

    public WhatsAppGroupService(
        AppDbContext dbContext,
        WahaClient waha,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _waha = waha;
        _options = options;
        _timeProvider = timeProvider;
    }

    public async Task<bool> ReachesClubGroupAsync(CancellationToken ct) =>
        _options.Value.IsConfigured
        && await _dbContext.LinkedWhatsAppGroups.AnyAsync(link => link.GroupId == null, ct);

    public async Task<Result> PickClubGroupAsync(string chatId, CancellationToken ct)
    {
        if (!_options.Value.IsConfigured)
            return Result.Conflict(WhatsAppMessages.SwitchedOff);

        var botGroups = await WahaReach.TryAsync(() => _waha.GroupsAsync(ct), ct);
        if (botGroups is null)
            return Result.Conflict(WhatsAppMessages.Unreachable);
        if (!botGroups.Value.Any(group => group.ChatId == chatId))
            return Result.NotFound(UnknownGroupMessage);

        await LinkClubAsync(chatId, ct);
        return Result.Success();
    }

    private async Task LinkClubAsync(string chatId, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.Database.ExecuteSqlAsync(
            $"LOCK TABLE linked_whatsapp_group IN SHARE ROW EXCLUSIVE MODE",
            ct
        );
        var keepsMembers = await _dbContext.LinkedWhatsAppGroups.AnyAsync(
            link => link.GroupId == null && link.KeepsMembers && link.ChatId == chatId,
            ct
        );
        await _dbContext
            .OutboxWhatsApps.Where(operation =>
                operation.Operation == WhatsAppOperation.AddParticipant
                && operation.ChatId != chatId
            )
            .ExecuteDeleteAsync(ct);
        await _dbContext
            .LinkedWhatsAppGroups.Where(link => link.GroupId == null || link.ChatId == chatId)
            .ExecuteDeleteAsync(ct);
        _dbContext.LinkedWhatsAppGroups.Add(
            new LinkedWhatsAppGroup
            {
                ChatId = chatId,
                LinkedAt = _timeProvider.GetUtcNow(),
                KeepsMembers = keepsMembers,
            }
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }
}
