using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Furria.Core.Identity;

namespace Furria.Core.Intakes;

public sealed class Intake : ITimestamped
{
    public const int LabelLength = 80;
    public const int SeedLength = 22;
    public const int TokenLength = 43;
    public const int TokenHashLength = 43;
    public const int NameLength = 128;
    public const int EmailLength = 256;
    public const int PhoneLength = 64;
    public const int StreetLength = 256;
    public const int ZipLength = 16;
    public const int CityLength = 128;

    public static readonly TimeSpan Lifetime = TimeSpan.FromDays(7);

    public int Id { get; set; }

    public int? StartedByPersonId { get; set; }

    public DateOnly? MemberFrom { get; set; }

    public string? Label { get; set; }

    public string? TokenSeed { get; set; }

    public string TokenHash { get; set; } = "";

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? SubmittedAt { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public DateTimeOffset? DiscardedAt { get; set; }

    public int? PersonId { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Street { get; set; }

    public string? Zip { get; set; }

    public string? City { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public bool ClubGroupConsent { get; set; }

    public int Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? StartedBy { get; set; }

    public Person? Person { get; set; }

    public ICollection<IntakeGroup> Groups { get; set; } = [];

    public bool RequiresAddress => MemberFrom is not null;

    [Pure]
    public static DateTimeOffset ExpiryFor(DateTimeOffset issuedAt) => issuedAt + Lifetime;

    [Pure]
    public static DateOnly RejoinOn(DateOnly memberFrom, DateOnly? lastEndedOn) =>
        lastEndedOn is { } endedOn && endedOn >= memberFrom ? endedOn.AddDays(1) : memberFrom;

    [Pure]
    public IntakeState StateAt(DateTimeOffset now) =>
        StateOf(DiscardedAt, CompletedAt, SubmittedAt, ExpiresAt, now);

    [Pure]
    public static IntakeLinkState LinkStateOf(IntakeState state) =>
        state switch
        {
            IntakeState.Open => IntakeLinkState.Open,
            IntakeState.Expired => IntakeLinkState.Expired,
            IntakeState.Discarded => IntakeLinkState.Discarded,
            _ => IntakeLinkState.Used,
        };

    [Pure]
    public static IntakeState StateOf(
        DateTimeOffset? discardedAt,
        DateTimeOffset? completedAt,
        DateTimeOffset? submittedAt,
        DateTimeOffset expiresAt,
        DateTimeOffset now
    ) =>
        discardedAt is not null ? IntakeState.Discarded
        : completedAt is not null ? IntakeState.Completed
        : submittedAt is not null ? IntakeState.NeedsReview
        : now >= expiresAt ? IntakeState.Expired
        : IntakeState.Open;
}
