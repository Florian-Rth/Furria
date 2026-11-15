namespace Furria.Core.BeerList;

public sealed class BeerDrink
{
    public const int NameLength = 40;

    public int Id { get; set; }

    public string Name { get; set; } = "";
}
