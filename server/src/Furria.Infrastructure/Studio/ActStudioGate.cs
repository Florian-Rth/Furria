using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.RunningOrders;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActStudioGate
{
    private const string NotStudioEditorMessage =
        "Das Studio bearbeitet nur die Leitung der Gruppe oder wer den Auftritt mitbearbeitet.";
    private const string ArchivedActMessage =
        "Ein archivierter Auftritt lässt sich nicht bearbeiten.";
    private const string ClosedSessionMessage =
        "Die Session dieses Auftritts ist vorbei, er bleibt so, wie er war.";

    public const string UnknownActMessage = "Diesen Auftritt gibt es nicht.";

    private readonly AppDbContext _dbContext;
    private readonly ActCatalogue _catalogue;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public ActStudioGate(
        AppDbContext dbContext,
        ActCatalogue catalogue,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _catalogue = catalogue;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<ActSummary?> ActAsync(int actId, CancellationToken ct) =>
        (
            await _catalogue.ActsOnAsync(act => act.Id == actId, ClubClock.Today(_timeProvider), ct)
        ).SingleOrDefault();

    public async Task<StudioEditorship> EditorshipOfAsync(
        int accountId,
        ActSummary act,
        CancellationToken ct
    )
    {
        var personId = await _authorizer.ActivePersonIdAsync(accountId, ct);
        int? castMemberId =
            personId is { } id && act.Cast.Any(member => member.PersonId == id) ? id : null;

        return new StudioEditorship
        {
            InCast = castMemberId is not null,
            IsCoEditor =
                castMemberId is { } memberId && await IsCoEditorAsync(act.ActId, memberId, ct),
            LeadsGroup = await LeadsGroupAsync(accountId, act, ct),
        };
    }

    public async Task<Result> EditableStudioAsync(int accountId, int actId, CancellationToken ct)
    {
        var editable = await EditableActAsync(accountId, actId, ct);

        return editable.IsSuccess ? Result.Success() : Result.Carrying(editable);
    }

    public async Task<Result<ActSummary>> EditableActAsync(
        int accountId,
        int actId,
        CancellationToken ct
    )
    {
        var act = await ActAsync(actId, ct);
        if (act is null)
            return Result<ActSummary>.NotFound(UnknownActMessage);
        if (!(await EditorshipOfAsync(accountId, act, ct)).MayEditStudio)
            return Result<ActSummary>.Forbidden(NotStudioEditorMessage);

        return ReadOnlyRefusalOf(act) is { } refused
            ? Result<ActSummary>.Carrying(refused)
            : Result<ActSummary>.Success(act);
    }

    public async Task<bool> LeadsGroupAsync(int accountId, ActSummary act, CancellationToken ct) =>
        act.Group is { } group && await _authorizer.IsGroupAdminAsync(accountId, group.GroupId, ct);

    [Pure]
    public static Result? ReadOnlyRefusalOf(ActSummary act) =>
        act.IsArchived ? Result.Conflict(ArchivedActMessage)
        : act.IsClosed ? Result.Conflict(ClosedSessionMessage)
        : null;

    [Pure]
    public static bool IsEditable(ActSummary act) => ReadOnlyRefusalOf(act) is null;

    private Task<bool> IsCoEditorAsync(int actId, int personId, CancellationToken ct) =>
        _dbContext.ActCoEditors.AnyAsync(
            editor => editor.ActId == actId && editor.PersonId == personId,
            ct
        );
}
