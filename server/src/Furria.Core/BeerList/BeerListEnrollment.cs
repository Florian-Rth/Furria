using Furria.Core.Club;
using Furria.Core.Identity;

namespace Furria.Core.BeerList;

public sealed class BeerListEnrollment : ITimestamped
{
    public int Id { get; set; }

    public int PersonId { get; set; }

    public DateTimeOffset StartedAt { get; set; }

    public DateTimeOffset? EndedAt { get; set; }

    public int? EndedByPersonId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? Person { get; set; }

    public Person? EndedBy { get; set; }
}
