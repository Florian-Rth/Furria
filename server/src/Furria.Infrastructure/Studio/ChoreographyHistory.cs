using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.RunningOrders;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ChoreographyHistory
{
    private const int VersionsPerPage = 20;

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly ActCatalogue _catalogue;
    private readonly TimeProvider _timeProvider;
    private readonly Dictionary<int, int?> _authorsByAccount = [];

    public ChoreographyHistory(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        ActCatalogue catalogue,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _catalogue = catalogue;
        _timeProvider = timeProvider;
    }

    public async Task WriteAsync(
        Choreography choreography,
        ChoreographyWrite write,
        CancellationToken ct
    )
    {
        if (_dbContext.Entry(choreography).State != EntityState.Added)
            choreography.Version++;
        choreography.Document = write.Document;

        _dbContext.ChoreographyVersions.Add(
            new ChoreographyVersion
            {
                Choreography = choreography,
                Version = choreography.Version,
                Kind = write.Kind,
                RestoredFromVersion = write.RestoredFromVersion,
                Document = write.Document,
                SavedByPersonId = await AuthorOfAsync(write.AccountId, ct),
                SavedAt = _timeProvider.GetUtcNow(),
            }
        );
        if (_dbContext.Entry(choreography).State != EntityState.Added)
            await ThinOutAsync(choreography.Id, ct);
    }

    public async Task<ChoreographyDocument?> DocumentAtAsync(
        Choreography choreography,
        int version,
        CancellationToken ct
    ) =>
        version == choreography.Version
            ? choreography.Document
            : await _dbContext
                .ChoreographyVersions.Where(row =>
                    row.ChoreographyId == choreography.Id && row.Version == version
                )
                .Select(row => row.Document)
                .SingleOrDefaultAsync(ct);

    public Task<bool> MusicAdoptedSinceAsync(
        Choreography choreography,
        int version,
        CancellationToken ct
    ) =>
        _dbContext.ChoreographyVersions.AnyAsync(
            row =>
                row.ChoreographyId == choreography.Id
                && row.Version > version
                && row.Kind == ChoreographyVersionKind.MusicAdopted,
            ct
        );

    public async Task<ChoreographyVersionPage> VersionsOfAsync(
        int? choreographyId,
        int? before,
        CancellationToken ct
    )
    {
        if (choreographyId is not { } id)
            return ChoreographyVersionPage.Empty;

        var history = _dbContext
            .ChoreographyVersions.AsNoTracking()
            .Where(row => row.ChoreographyId == id);
        var rows = await history
            .Where(row => before == null || row.Version < before)
            .OrderByDescending(row => row.Version)
            .Take(VersionsPerPage + 1)
            .Select(row => new
            {
                row.Version,
                row.Kind,
                row.RestoredFromVersion,
                row.SavedAt,
                row.SavedByPersonId,
            })
            .ToListAsync(ct);
        var page = rows.Take(VersionsPerPage).ToList();
        var authors = (
            await _catalogue.PersonsInNameOrderAsync(
                [.. page.Select(row => row.SavedByPersonId).OfType<int>().Distinct()],
                ct
            )
        ).ToDictionary(person => person.PersonId);

        return new ChoreographyVersionPage
        {
            Versions =
            [
                .. page.Select(row => new ChoreographyVersionSummary
                {
                    Version = row.Version,
                    Kind = row.Kind,
                    RestoredFromVersion = row.RestoredFromVersion,
                    SavedAt = row.SavedAt,
                    SavedBy = row.SavedByPersonId is { } author
                        ? authors.GetValueOrDefault(author)
                        : null,
                }),
            ],
            Total = await history.CountAsync(ct),
            HasOlder = rows.Count > VersionsPerPage,
        };
    }

    private async Task ThinOutAsync(int choreographyId, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var cutoff = ChoreographyRetention.ThinningCutoff(now);
        var old = await _dbContext
            .ChoreographyVersions.Where(row =>
                row.ChoreographyId == choreographyId && row.SavedAt < cutoff
            )
            .Select(row => new
            {
                row.Id,
                row.Version,
                row.Kind,
                row.SavedAt,
            })
            .ToListAsync(ct);
        var thinned = ChoreographyRetention
            .ThinnedOf(
                old.Select(row => new ChoreographyVersionStamp(row.Version, row.Kind, row.SavedAt)),
                now
            )
            .ToHashSet();

        foreach (var row in old.Where(row => thinned.Contains(row.Version)))
            _dbContext.ChoreographyVersions.Remove(TrackedVersionOf(row.Id));
    }

    private ChoreographyVersion TrackedVersionOf(int versionId) =>
        _dbContext.ChoreographyVersions.Local.FirstOrDefault(row => row.Id == versionId)
        ?? _dbContext
            .ChoreographyVersions.Attach(new ChoreographyVersion { Id = versionId })
            .Entity;

    private async Task<int?> AuthorOfAsync(int? accountId, CancellationToken ct)
    {
        if (accountId is not { } id)
            return null;
        if (!_authorsByAccount.TryGetValue(id, out var author))
        {
            author = await _authorizer.ActivePersonIdAsync(id, ct);
            _authorsByAccount[id] = author;
        }

        return author;
    }
}
