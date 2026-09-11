using Furria.Core.Club;

namespace Furria.Core.Identity;

public sealed class FeeReduction : ITimestamped
{
    public int Id { get; set; }

    public int PersonId { get; set; }

    public FeeReductionBasis Basis { get; set; }

    public int FirstSessionYear { get; set; }

    public int LastSessionYear { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? Person { get; set; }
}
