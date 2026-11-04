namespace Furria.Core.Halls;

public sealed record TablePlanCount(int Tables, int Chairs)
{
    public static readonly TablePlanCount None = new(0, 0);
}
