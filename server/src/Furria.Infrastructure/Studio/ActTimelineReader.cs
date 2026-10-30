using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActTimelineReader
{
    private readonly AppDbContext _dbContext;

    public ActTimelineReader(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ActTimeline> TimelineOfAsync(int actId, CancellationToken ct)
    {
        var music = new ActMusic((await MusicOfAsync(actId, ct)).Select(source => source.Cut));
        var stepStarts = await _dbContext
            .ActSteps.Where(step => step.ActId == actId)
            .Select(step => new
            {
                step.Id,
                step.StartSourceMediaItemId,
                step.StartSeconds,
            })
            .ToListAsync(ct);
        var steps = ActSteps.Tile(
            stepStarts.Select(step => new StepStart(
                step.Id,
                new MusicAnchor(step.StartSourceMediaItemId, step.StartSeconds)
            )),
            music
        );
        var partStarts = await _dbContext
            .ActParts.Where(part => part.ActId == actId)
            .Select(part => new { part.Id, part.FirstStepId })
            .ToListAsync(ct);

        return new ActTimeline(
            music,
            steps,
            ActParts.Tile(
                steps,
                partStarts.Select(part => new PartStart(part.Id, part.FirstStepId))
            )
        );
    }

    public async Task<IReadOnlyDictionary<int, double>> MusicLengthsOfAsync(
        IReadOnlyCollection<int> actIds,
        CancellationToken ct
    )
    {
        var adopted = await _dbContext
            .ActFinalTracks.AsNoTracking()
            .Where(track => actIds.Contains(track.ActId) && track.AdoptedAt != null)
            .Select(track => new
            {
                track.ActId,
                track.Version,
                track.MediaItem!.DurationSeconds,
            })
            .ToListAsync(ct);
        var adoptedLengths = adopted
            .GroupBy(track => track.ActId)
            .ToDictionary(
                tracks => tracks.Key,
                tracks =>
                    tracks.OrderByDescending(track => track.Version).First().DurationSeconds ?? 0
            );
        var songs = await _dbContext
            .ActSongs.AsNoTracking()
            .Where(song => actIds.Contains(song.ActId))
            .OrderBy(song => song.Position)
            .ThenBy(song => song.Id)
            .Select(song => new
            {
                song.ActId,
                song.MediaItemId,
                song.StartSeconds,
                song.EndSeconds,
                song.MediaItem!.DurationSeconds,
            })
            .ToListAsync(ct);
        var mixLengths = songs
            .GroupBy(song => song.ActId)
            .ToDictionary(
                mix => mix.Key,
                mix =>
                    new ActMusic(
                        mix.Select(song => new MusicCut(
                            song.MediaItemId,
                            song.StartSeconds,
                            song.EndSeconds ?? song.DurationSeconds ?? song.StartSeconds
                        ))
                    ).LengthSeconds
            );

        return actIds
            .Distinct()
            .ToDictionary(
                actId => actId,
                actId =>
                    adoptedLengths.TryGetValue(actId, out var adoptedLength)
                        ? adoptedLength
                        : mixLengths.GetValueOrDefault(actId)
            );
    }

    public async Task<IReadOnlyList<MusicSource>> MusicOfAsync(int actId, CancellationToken ct)
    {
        var adopted = await _dbContext
            .ActFinalTracks.Where(track => track.ActId == actId && track.AdoptedAt != null)
            .OrderByDescending(track => track.Version)
            .Select(track => new
            {
                track.MediaItemId,
                track.MediaItem!.StorageKey,
                track.MediaItem.DurationSeconds,
            })
            .FirstOrDefaultAsync(ct);
        if (adopted is not null)
            return
            [
                new MusicSource(
                    new MusicCut(adopted.MediaItemId, 0, adopted.DurationSeconds ?? 0),
                    adopted.StorageKey
                ),
            ];

        var songs = await _dbContext
            .ActSongs.Where(song => song.ActId == actId)
            .OrderBy(song => song.Position)
            .ThenBy(song => song.Id)
            .Select(song => new
            {
                song.MediaItemId,
                song.StartSeconds,
                song.EndSeconds,
                song.MediaItem!.StorageKey,
                song.MediaItem.DurationSeconds,
            })
            .ToListAsync(ct);

        return
        [
            .. songs.Select(song => new MusicSource(
                new MusicCut(
                    song.MediaItemId,
                    song.StartSeconds,
                    song.EndSeconds ?? song.DurationSeconds ?? song.StartSeconds
                ),
                song.StorageKey
            )),
        ];
    }
}
