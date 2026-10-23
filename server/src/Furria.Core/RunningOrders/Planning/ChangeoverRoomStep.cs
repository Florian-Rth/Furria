namespace Furria.Core.RunningOrders.Planning;

internal sealed class ChangeoverRoomStep : ICostStep
{
    public RunningOrderCostStep Step => RunningOrderCostStep.ChangeoverRoom;

    public int Weight => 1;

    public int BaseViolations(PlanFacts facts) => 0;

    public int ViolationsAddedByLastLine(PartialOrder partial, PlanFacts facts)
    {
        var position = partial.Count - 1;
        var slots = partial.Last.PersonSlots;
        var room = 0;
        for (var index = 0; index < slots.Count; index++)
        {
            if (partial.EarlierIndexOfLastLinePerson(index) is { } earlier)
                room += ChangeoverRoom.CostOf(position - earlier - 1);
        }

        return room;
    }

    public int ViolationsOf(CompleteOrder order)
    {
        var partial = new PartialOrder(order.Facts);
        var room = 0;
        foreach (var key in order.Keys)
        {
            partial.Push(order.Facts.LineOf(key));
            room += ViolationsAddedByLastLine(partial, order.Facts);
        }

        return room;
    }
}
