namespace Furria.Core.Club;

public interface ITimestamped
{
    DateTimeOffset CreatedAt { get; set; }

    DateTimeOffset UpdatedAt { get; set; }
}
