using Furria.Core.Groups;
using Furria.Core.Identity;

namespace Furria.Core.News;

public sealed class NewsPostMention
{
    public int Id { get; set; }

    public int NewsPostId { get; set; }

    public int? GroupId { get; set; }

    public int? PersonId { get; set; }

    public NewsPost? NewsPost { get; set; }

    public Group? Group { get; set; }

    public Person? Person { get; set; }
}
