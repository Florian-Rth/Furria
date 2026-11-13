namespace Furria.Core.Push;

public sealed record PushListener
{
    public required bool IsCalendarAudience { get; init; }

    public required bool ReadsAnnouncements { get; init; }

    public required bool KeepsBeerTab { get; init; }

    public required bool ManagesBeerList { get; init; }
}
