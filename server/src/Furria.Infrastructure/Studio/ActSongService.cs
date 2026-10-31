using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActSongService
{
    private const string UnknownSongFileMessage = "Diese Musikdatei gehört nicht zum Auftritt.";
    private const string SongTwiceMessage = "Dieses Lied ist schon in der Musik des Auftritts.";
    private const string FinalTrackMessage =
        "Diese Datei ist eine Endfassung und kann kein Lied der Musik sein.";
    private const string FullMixMessage = "Mehr Lieder passen nicht in die Musik eines Auftritts.";
    private const string UnknownSongMessage = "Dieses Lied gibt es im Auftritt nicht.";
    private const string StaleOrderMessage =
        "Die Lieder haben sich inzwischen geändert. Lade die Musik neu und ordne sie erneut.";
    private const string CutPastEndMessage = "Das Ende liegt hinter dem Ende des Lieds.";
    private const string FirstBeatPastEndMessage =
        "Die erste Eins liegt hinter dem Ende des Lieds.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;

    public ActSongService(AppDbContext dbContext, ActStudioGate gate)
    {
        _dbContext = dbContext;
        _gate = gate;
    }

    public async Task<Result<int>> AddAsync(
        int accountId,
        AddActSongCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);
        if (!await IsSongFileOfAsync(command.ActId, command.MediaItemId, ct))
            return Result<int>.NotFound(UnknownSongFileMessage);
        if (await IsSongAsync(command.MediaItemId, ct))
            return Result<int>.Conflict(SongTwiceMessage);
        if (await IsFinalTrackAsync(command.MediaItemId, ct))
            return Result<int>.Conflict(FinalTrackMessage);
        if (await SongCountOfAsync(command.ActId, ct) >= ActSong.MostPerAct)
            return Result<int>.Conflict(FullMixMessage);

        var song = new ActSong
        {
            ActId = command.ActId,
            MediaItemId = command.MediaItemId,
            Position = await NextPositionAsync(command.ActId, ct),
        };
        _dbContext.ActSongs.Add(song);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(song.Id);
    }

    public async Task<Result> OrderAsync(
        int accountId,
        ActSongOrderCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var songs = await _dbContext
            .ActSongs.Where(song => song.ActId == command.ActId)
            .ToDictionaryAsync(song => song.Id, ct);
        if (!NamesEachSongOnce(command.SongIds, songs.Keys))
            return Result.Conflict(StaleOrderMessage);

        foreach (var (songId, position) in command.SongIds.Select((id, index) => (id, index)))
            songs[songId].Position = position;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> CutAsync(
        int accountId,
        ActSongCutCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var song = await _dbContext
            .ActSongs.Where(song => song.Id == command.SongId && song.ActId == command.ActId)
            .Select(song => new { song.MediaItem!.DurationSeconds })
            .SingleOrDefaultAsync(ct);
        if (song is null)
            return Result.NotFound(UnknownSongMessage);
        if (BeyondTheSongRefusalOf(command, song.DurationSeconds) is { } refused)
            return refused;

        await _dbContext
            .ActSongs.Where(row => row.Id == command.SongId)
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(row => row.StartSeconds, command.StartSeconds)
                        .SetProperty(row => row.EndSeconds, command.EndSeconds)
                        .SetProperty(row => row.FirstBeatSeconds, command.FirstBeatSeconds)
                        .SetProperty(row => row.TempoBpm, command.TempoBpm),
                ct
            );

        return Result.Success();
    }

    public async Task<Result> RemoveAsync(
        int accountId,
        RemoveActSongCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var removed = await _dbContext
            .ActSongs.Where(song => song.Id == command.SongId && song.ActId == command.ActId)
            .ExecuteDeleteAsync(ct);

        return removed == 0 ? Result.NotFound(UnknownSongMessage) : Result.Success();
    }

    private Task<bool> IsSongFileOfAsync(int actId, int mediaItemId, CancellationToken ct) =>
        _dbContext.MediaItems.AnyAsync(
            item =>
                item.Id == mediaItemId
                && item.OwnerKind == MediaOwnerKind.Act
                && item.OwnerActId == actId
                && item.Kind == MediaKind.Audio,
            ct
        );

    private Task<bool> IsSongAsync(int mediaItemId, CancellationToken ct) =>
        _dbContext.ActSongs.AnyAsync(song => song.MediaItemId == mediaItemId, ct);

    private Task<bool> IsFinalTrackAsync(int mediaItemId, CancellationToken ct) =>
        _dbContext.ActFinalTracks.AnyAsync(track => track.MediaItemId == mediaItemId, ct);

    private Task<int> SongCountOfAsync(int actId, CancellationToken ct) =>
        _dbContext.ActSongs.CountAsync(song => song.ActId == actId, ct);

    private async Task<int> NextPositionAsync(int actId, CancellationToken ct) =>
        await _dbContext
            .ActSongs.Where(song => song.ActId == actId)
            .MaxAsync(song => (int?)song.Position, ct)
            is { } last
            ? last + 1
            : 0;

    [Pure]
    private static bool NamesEachSongOnce(IReadOnlyList<int> songIds, IEnumerable<int> actual) =>
        songIds.Count == songIds.Distinct().Count() && songIds.ToHashSet().SetEquals(actual);

    [Pure]
    private static Result? BeyondTheSongRefusalOf(ActSongCutCommand cut, double? durationSeconds) =>
        MusicFile.IsPastTheEnd(cut.EndSeconds, durationSeconds)
            ? Result.Validation(CutPastEndMessage)
        : MusicFile.IsPastTheEnd(cut.FirstBeatSeconds, durationSeconds)
            ? Result.Validation(FirstBeatPastEndMessage)
        : null;
}
