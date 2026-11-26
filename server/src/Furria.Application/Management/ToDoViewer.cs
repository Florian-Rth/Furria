namespace Furria.Application.Management;

public sealed record ToDoViewer(
    IReadOnlySet<string> GrantedKeys,
    IReadOnlyCollection<int> AdministeredGroupIds
);
