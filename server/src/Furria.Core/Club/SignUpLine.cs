using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class SignUpLine : ITimestamped
{
    public int Id { get; set; }

    public int SignUpListId { get; set; }

    public int PersonId { get; set; }

    public string? Text { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public SignUpList? SignUpList { get; set; }

    public Person? Person { get; set; }
}
