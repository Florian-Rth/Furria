using Furria.Application.Management;
using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Management;

public sealed class ToDoMark
{
    public int Id { get; set; }

    public int AccountId { get; set; }

    public ToDoKind Kind { get; set; }

    public string[] SeenSubjects { get; set; } = [];

    public DateTimeOffset SeenAt { get; set; }

    public Account? Account { get; set; }
}
