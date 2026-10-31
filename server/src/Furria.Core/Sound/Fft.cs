using System.Numerics;

namespace Furria.Core.Sound;

public static class Fft
{
    public static int SizeFor(int length) => (int)BitOperations.RoundUpToPowerOf2((uint)length);

    public static void Forward(Complex[] values) => Transform(values, direction: -1);

    public static void Inverse(Complex[] values)
    {
        Transform(values, direction: 1);
        for (var index = 0; index < values.Length; index++)
            values[index] /= values.Length;
    }

    private static void Transform(Complex[] values, int direction)
    {
        BitReverse(values);
        for (var length = 2; length <= values.Length; length <<= 1)
            Butterflies(values, length, direction);
    }

    private static void BitReverse(Complex[] values)
    {
        for (int index = 1, reversed = 0; index < values.Length; index++)
        {
            var bit = values.Length >> 1;
            for (; (reversed & bit) != 0; bit >>= 1)
                reversed ^= bit;
            reversed ^= bit;
            if (index < reversed)
                (values[index], values[reversed]) = (values[reversed], values[index]);
        }
    }

    private static void Butterflies(Complex[] values, int length, int direction)
    {
        var half = length / 2;
        var angle = direction * 2 * Math.PI / length;
        var step = new Complex(Math.Cos(angle), Math.Sin(angle));
        for (var start = 0; start < values.Length; start += length)
        {
            var twiddle = Complex.One;
            for (var offset = 0; offset < half; offset++)
            {
                var even = values[start + offset];
                var odd = values[start + offset + half] * twiddle;
                values[start + offset] = even + odd;
                values[start + offset + half] = even - odd;
                twiddle *= step;
            }
        }
    }
}
