using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal struct GapPool
{
    private int _atZero;
    private int _atOne;
    private int _atTwo;
    private int _atThree;
    private int _atFour;

    public void AddOpenGaps(int count) => _atZero += count;

    public void AddGapWithAuftritteAlreadyBetween(int between)
    {
        switch (between)
        {
            case 0:
                _atZero++;
                break;
            case 1:
                _atOne++;
                break;
            case 2:
                _atTwo++;
                break;
            case 3:
                _atThree++;
                break;
            case 4:
                _atFour++;
                break;
        }
    }

    public void Add(GapPool other)
    {
        _atZero += other._atZero;
        _atOne += other._atOne;
        _atTwo += other._atTwo;
        _atThree += other._atThree;
        _atFour += other._atFour;
    }

    [Pure]
    public readonly int RoomAtLeast(int spare, int tightGapsAllowed)
    {
        var tightFromZero = Math.Min(_atZero, tightGapsAllowed);
        var atZero = _atZero - tightFromZero;
        var atOne = _atOne - Math.Min(_atOne, tightGapsAllowed - tightFromZero);
        var left = spare - 2 * atZero - atOne;
        if (left < 0)
            return 0;

        var atTwo = atZero + atOne + _atTwo;
        var halvings = Math.Min(left, atTwo);
        var singles = Math.Min(left - halvings, 2 * atTwo + 2 * _atThree + _atFour);

        return 4 * atTwo + 2 * _atThree + _atFour - 2 * halvings - singles;
    }
}
