using System.Data;
using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.RunningOrders;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActStudioService
{
    private const string NoTieMessage = "Dieser Auftritt gehört nicht zu deinen Gruppen.";
    private const string NotGroupAdminMessage =
        "Mitbearbeiter ernennt nur die Leitung der Gruppe des Auftritts.";
    private const string NotInCastMessage = "Mitbearbeiten kann nur, wer im Auftritt mitmacht.";
    private const string NoCoEditorMessage = "Diese Person bearbeitet den Auftritt nicht mit.";
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht.";

    private readonly AppDbContext _dbContext;
    private readonly ActCatalogue _catalogue;
    private readonly ActStudioReader _reader;
    private readonly ActGlanceReader _glances;
    private readonly ActStudioGate _gate;
    private readonly ActAccess _actAccess;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public ActStudioService(
        AppDbContext dbContext,
        ActCatalogue catalogue,
        ActStudioReader reader,
        ActGlanceReader glances,
        ActStudioGate gate,
        ActAccess actAccess,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _catalogue = catalogue;
        _reader = reader;
        _glances = glances;
        _gate = gate;
        _actAccess = actAccess;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<Result<ActStudioDetails>> GetStudioAsync(
        int accountId,
        int actId,
        CancellationToken ct
    )
    {
        var act = await _gate.ActAsync(actId, ct);
        if (act is null)
            return Result<ActStudioDetails>.NotFound(ActStudioGate.UnknownActMessage);

        var editorship = await _gate.EditorshipOfAsync(accountId, act, ct);
        var scope = await _actAccess.ScopeOfAsync(accountId, ct);
        var canEditSettings = scope is not null && scope.Covers(act.Group?.GroupId);
        var seesStudio = editorship.InCast || editorship.LeadsGroup;
        var editable = ActStudioGate.IsEditable(act);
        if (!seesStudio && !canEditSettings && !await BelongsToGroupAsync(accountId, act, ct))
            return Result<ActStudioDetails>.Forbidden(NoTieMessage);

        await using var snapshot = await _dbContext.Database.BeginTransactionAsync(
            IsolationLevel.RepeatableRead,
            ct
        );

        return Result<ActStudioDetails>.Success(
            new ActStudioDetails
            {
                Act = act,
                Viewer = new ActStudioViewer
                {
                    InCast = editorship.InCast,
                    CanEditSettings = !act.IsClosed && canEditSettings,
                    CanEditStudio = editable && editorship.MayEditStudio,
                    CanGrantCoEditors = editable && editorship.LeadsGroup,
                    CanMarkAttendance = editable && editorship.LeadsGroup,
                },
                CoEditors = seesStudio ? await CoEditorsOfAsync(actId, ct) : [],
                Content = seesStudio ? await _reader.ContentOfAsync(act, ct) : null,
            }
        );
    }

    public async Task<Result> GrantCoEditorAsync(
        int accountId,
        ActPersonCommand command,
        CancellationToken ct
    )
    {
        var act = await _gate.ActAsync(command.ActId, ct);
        if (act is null)
            return Result.NotFound(ActStudioGate.UnknownActMessage);
        if (!await _gate.LeadsGroupAsync(accountId, act, ct))
            return Result.Forbidden(NotGroupAdminMessage);
        if (ActStudioGate.ReadOnlyRefusalOf(act) is { } refused)
            return refused;
        if (act.Cast.All(member => member.PersonId != command.PersonId))
            return Result.Conflict(NotInCastMessage);

        var grantedBy = await _authorizer.ActivePersonIdAsync(accountId, ct);
        var grantedAt = _timeProvider.GetUtcNow();
        await _dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"""
            INSERT INTO act_co_editor (act_id, person_id, granted_by_person_id, granted_at)
            VALUES ({command.ActId}, {command.PersonId}, {grantedBy}, {grantedAt})
            ON CONFLICT (act_id, person_id) DO NOTHING
            """,
            ct
        );

        return Result.Success();
    }

    public async Task<Result> RevokeCoEditorAsync(
        int accountId,
        ActPersonCommand command,
        CancellationToken ct
    )
    {
        var act = await _gate.ActAsync(command.ActId, ct);
        if (act is null)
            return Result.NotFound(ActStudioGate.UnknownActMessage);
        if (!await _gate.LeadsGroupAsync(accountId, act, ct))
            return Result.Forbidden(NotGroupAdminMessage);

        var revoked = await _dbContext
            .ActCoEditors.Where(editor =>
                editor.ActId == command.ActId && editor.PersonId == command.PersonId
            )
            .ExecuteDeleteAsync(ct);

        return revoked == 0 ? Result.NotFound(NoCoEditorMessage) : Result.Success();
    }

    public async Task<IReadOnlyList<MyActSummary>> GetMyActsAsync(
        int accountId,
        CancellationToken ct
    )
    {
        var personId = await _authorizer.ActivePersonIdAsync(accountId, ct);
        if (personId is null)
            return [];

        var today = ClubClock.Today(_timeProvider);
        var viewer = new ActGlanceViewer(
            personId.Value,
            await _authorizer.AdministeredGroupIdsAsync(accountId, ct),
            await CoEditedActIdsAsync(personId.Value, ct),
            today,
            ClubSession.RelevantYearOf(today)
        );
        var acts = await _catalogue.ActsOnAsync(
            act =>
                act.SessionYear == viewer.SessionYear
                && act.ArchivedAt == null
                && (
                    viewer.CoEditedActIds.Contains(act.Id)
                    || (act.GroupId != null && viewer.LedGroupIds.Contains(act.GroupId.Value))
                    || act.CastChanges.Any(change => change.PersonId == viewer.PersonId)
                    || _dbContext.GroupMemberships.Any(membership =>
                        membership.GroupId == act.GroupId && membership.PersonId == viewer.PersonId
                    )
                ),
            today,
            ct
        );

        return await _glances.GlancesOfAsync(
            [.. acts.Where(act => Involves(act, viewer))],
            viewer,
            ct
        );
    }

    public async Task<Result<GroupActsDetails>> GetGroupActsAsync(
        int accountId,
        int groupId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.Groups.AnyAsync(group => group.Id == groupId, ct))
            return Result<GroupActsDetails>.NotFound(UnknownGroupMessage);

        var scope = await _actAccess.ScopeOfAsync(accountId, ct);
        var mayLook =
            scope?.Covers(groupId) == true
            || await _authorizer.IsGroupMemberOrAdminAsync(accountId, groupId, ct);
        if (!mayLook)
            return Result<GroupActsDetails>.Forbidden(NoTieMessage);

        var personId = await _authorizer.ActivePersonIdAsync(accountId, ct);
        var today = ClubClock.Today(_timeProvider);
        var acts = await _catalogue.ActsOnAsync(
            act => act.GroupId == groupId && act.SessionYear != null && act.ArchivedAt == null,
            today,
            ct
        );

        return Result<GroupActsDetails>.Success(
            new GroupActsDetails
            {
                RelevantSessionYear = ClubSession.RelevantYearOf(today),
                Acts =
                [
                    .. acts.OrderByDescending(act => act.SessionYear)
                        .Select(act => new GroupActSummary
                        {
                            ActId = act.ActId,
                            Name = act.Name,
                            Kind = act.Kind,
                            SessionYear = act.SessionYear!.Value,
                            IsClosed = act.IsClosed,
                            ViewerInCast = act.Cast.Any(member => member.PersonId == personId),
                        }),
                ],
            }
        );
    }

    private async Task<bool> BelongsToGroupAsync(
        int accountId,
        ActSummary act,
        CancellationToken ct
    ) =>
        act.Group is { } group
        && await _authorizer.IsGroupMemberOrAdminAsync(accountId, group.GroupId, ct);

    private async Task<List<int>> CoEditedActIdsAsync(int personId, CancellationToken ct) =>
        await _dbContext
            .ActCoEditors.Where(editor => editor.PersonId == personId)
            .Select(editor => editor.ActId)
            .ToListAsync(ct);

    private async Task<IReadOnlyList<ActCoEditorDetails>> CoEditorsOfAsync(
        int actId,
        CancellationToken ct
    )
    {
        var grants = await _dbContext
            .ActCoEditors.AsNoTracking()
            .Where(editor => editor.ActId == actId)
            .ToDictionaryAsync(editor => editor.PersonId, editor => editor.GrantedAt, ct);
        var persons = await _catalogue.PersonsInNameOrderAsync(grants.Keys, ct);

        return
        [
            .. persons.Select(person => new ActCoEditorDetails
            {
                Person = person,
                GrantedAt = grants[person.PersonId],
            }),
        ];
    }

    [Pure]
    private static bool Involves(ActSummary act, ActGlanceViewer viewer) =>
        viewer.CoEditedActIds.Contains(act.ActId)
        || (act.Group is { } group && viewer.LedGroupIds.Contains(group.GroupId))
        || act.Cast.Any(member => member.PersonId == viewer.PersonId);
}
