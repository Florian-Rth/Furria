using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string UnknownSignUpListMessage = "Diese Eintragsliste gibt es nicht.";
    private const string NotYourSignUpListMessage =
        "In diese Eintragsliste kannst du dich nicht eintragen.";
    private const string ClosedSignUpListMessage = "Diese Eintragsliste ist geschlossen.";
    private const string UnknownSignUpLineMessage = "Diesen Eintrag gibt es nicht.";

    public async Task<Result> WriteOwnSignUpLineAsync(
        WriteOwnSignUpLineCommand command,
        CancellationToken ct
    )
    {
        if (await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct) is not { } personId)
            return Result.Forbidden(NotYourSignUpListMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

        if (
            await OpenSignUpListRefusalAsync(
                command.ActorAccountId,
                personId,
                command.SignUpListId,
                AddOnAccess.Answer,
                ct
            ) is
            { } refusal
        )
            return refusal;

        var line = await _dbContext.SignUpLines.SingleOrDefaultAsync(
            row => row.SignUpListId == command.SignUpListId && row.PersonId == personId,
            ct
        );

        if (line is null)
        {
            line = new SignUpLine { SignUpListId = command.SignUpListId, PersonId = personId };
            _dbContext.SignUpLines.Add(line);
        }

        line.Text = LineTextOf(command.Text);

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result> DeleteOwnSignUpLineAsync(
        int actorAccountId,
        int signUpListId,
        CancellationToken ct
    )
    {
        if (await _authorizer.ActivePersonIdAsync(actorAccountId, ct) is not { } personId)
            return Result.Forbidden(NotYourSignUpListMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

        if (
            await OpenSignUpListRefusalAsync(
                actorAccountId,
                personId,
                signUpListId,
                AddOnAccess.Sight,
                ct
            ) is
            { } refusal
        )
            return refusal;

        await _dbContext
            .SignUpLines.Where(line =>
                line.SignUpListId == signUpListId && line.PersonId == personId
            )
            .ExecuteDeleteAsync(ct);

        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result> RemoveSignUpLineAsync(
        int actorAccountId,
        int lineId,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM calendar_entry entry JOIN sign_up_list list ON list.calendar_entry_id = entry.id JOIN sign_up_line line ON line.sign_up_list_id = list.id WHERE line.id = {lineId} FOR SHARE OF entry",
            ct
        );

        if (await SignUpLineHostAsync(lineId, ct) is not { } host)
            return Result.NotFound(UnknownSignUpLineMessage);

        if (!await MayManageAsync(actorAccountId, host, ct))
            return Result.Forbidden(NotOwnedMessage);

        await _dbContext.SignUpLines.Where(line => line.Id == lineId).ExecuteDeleteAsync(ct);

        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result> CloseSignUpListAsync(
        int actorAccountId,
        int signUpListId,
        CancellationToken ct
    )
    {
        var closerPersonId = await _authorizer.ActivePersonIdAsync(actorAccountId, ct);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LockSignUpListAsync(signUpListId, ct);

        var list = await _dbContext.SignUpLists.SingleOrDefaultAsync(
            row => row.Id == signUpListId,
            ct
        );

        if (list is null || await SignUpListHostAsync(signUpListId, ct) is not { } host)
            return Result.NotFound(UnknownSignUpListMessage);

        if (!await MayManageAsync(actorAccountId, host, ct))
            return Result.Forbidden(NotOwnedMessage);

        if (list.ClosedAt is null)
        {
            var closing = AddOnClosing.CloseOf(
                list.SignUpUntil,
                host.ClosesAt,
                _timeProvider.GetUtcNow(),
                closerPersonId
            );
            list.ClosedAt = closing.ClosedAt;
            list.ClosedByPersonId = closing.ClosedByPersonId;
        }

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static string? LineTextOf(string? text) =>
        string.IsNullOrWhiteSpace(text) ? null : text.Trim();

    private async Task<Result?> OpenSignUpListRefusalAsync(
        int actorAccountId,
        int personId,
        int signUpListId,
        AddOnAccess access,
        CancellationToken ct
    )
    {
        await LockSignUpListAsync(signUpListId, ct);

        var host = await SignUpListHostAsync(signUpListId, ct);
        var sight = new AddOnSight(
            actorAccountId,
            personId,
            host,
            UnknownSignUpListMessage,
            NotYourSignUpListMessage,
            access
        );

        if (await AddOnSightRefusalAsync(sight, ct) is { } unseen)
            return unseen;

        if (host is null)
            return Result.NotFound(UnknownSignUpListMessage);

        var closing = await _dbContext
            .SignUpLists.AsNoTracking()
            .Where(list => list.Id == signUpListId)
            .Select(list => new SignUpClosingRow(list.ClosedAt, list.SignUpUntil))
            .SingleAsync(ct);

        return AddOnClosing.IsClosed(
            closing.ClosedAt,
            closing.SignUpUntil,
            host.ClosesAt,
            _timeProvider.GetUtcNow()
        )
            ? Result.Validation(ClosedSignUpListMessage)
            : null;
    }

    private async Task LockSignUpListAsync(int signUpListId, CancellationToken ct)
    {
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM calendar_entry entry JOIN sign_up_list list ON list.calendar_entry_id = entry.id WHERE list.id = {signUpListId} FOR SHARE OF entry",
            ct
        );
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM sign_up_list WHERE id = {signUpListId} FOR NO KEY UPDATE",
            ct
        );
    }

    private sealed record SignUpClosingRow(DateTimeOffset? ClosedAt, DateTimeOffset? SignUpUntil);
}
