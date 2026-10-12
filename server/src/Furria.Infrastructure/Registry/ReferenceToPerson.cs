namespace Furria.Infrastructure.Registry;

public sealed record ReferenceToPerson(
    Type Entity,
    string Property,
    OnAbsorption OnAbsorption,
    OnErasure OnErasure
)
{
    public string Name => $"{Entity.Name}.{Property}";
}
