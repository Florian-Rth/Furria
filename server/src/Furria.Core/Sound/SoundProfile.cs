using System.Buffers.Binary;
using System.Diagnostics.Contracts;

namespace Furria.Core.Sound;

public sealed record SoundProfile(int FramesPerSecond, float[][] Bands)
{
    private const int HeaderLength = 16;
    private const int ValueLength = 2;
    private const int MostBands = 64;

    private static readonly byte[] Magic = "FSP1"u8.ToArray();

    public int FrameCount => Bands.Length == 0 ? 0 : Bands[0].Length;

    public double DurationSeconds => (double)FrameCount / FramesPerSecond;

    [Pure]
    public static SoundProfile Of(SoundSignal signal) => Of(BandOnsets.Of(signal));

    [Pure]
    public static SoundProfile Of(float[][] onsets) =>
        new(BandOnsets.FramesPerSecond, [.. onsets.Select(Standardised)]);

    [Pure]
    public byte[] ToBytes()
    {
        var bytes = new byte[HeaderLength + Bands.Length * FrameCount * ValueLength];
        Magic.CopyTo(bytes, 0);
        BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(4), FramesPerSecond);
        BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(8), Bands.Length);
        BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(12), FrameCount);
        var offset = HeaderLength;
        foreach (var value in Bands.SelectMany(band => band))
        {
            BinaryPrimitives.WriteHalfLittleEndian(bytes.AsSpan(offset), (Half)value);
            offset += ValueLength;
        }

        return bytes;
    }

    [Pure]
    public SoundProfile Excerpt(double startSeconds, double endSeconds)
    {
        var first = (int)Math.Round(startSeconds * FramesPerSecond);
        var length = Math.Max(0, (int)Math.Round(endSeconds * FramesPerSecond) - first);
        return new SoundProfile(
            FramesPerSecond,
            [.. Bands.Select(band => FramesOf(band, first, length))]
        );
    }

    [Pure]
    public static SoundProfile? Joined(IReadOnlyList<SoundProfile> profiles)
    {
        if (profiles.Count == 0)
            return null;
        var head = profiles[0];
        if (
            profiles.Any(profile =>
                profile.FramesPerSecond != head.FramesPerSecond
                || profile.Bands.Length != head.Bands.Length
            )
        )
            return null;

        return new SoundProfile(
            head.FramesPerSecond,
            [
                .. Enumerable
                    .Range(0, head.Bands.Length)
                    .Select(band => profiles.SelectMany(profile => profile.Bands[band]).ToArray()),
            ]
        );
    }

    [Pure]
    public static SoundProfile? Parse(ReadOnlySpan<byte> bytes)
    {
        if (bytes.Length < HeaderLength || !bytes.StartsWith(Magic))
            return null;

        var framesPerSecond = BinaryPrimitives.ReadInt32LittleEndian(bytes[4..]);
        var bandCount = BinaryPrimitives.ReadInt32LittleEndian(bytes[8..]);
        var frameCount = BinaryPrimitives.ReadInt32LittleEndian(bytes[12..]);
        if (
            framesPerSecond <= 0
            || bandCount <= 0
            || bandCount > MostBands
            || frameCount < 0
            || bytes.Length != HeaderLength + (long)bandCount * frameCount * ValueLength
        )
            return null;

        return new SoundProfile(
            framesPerSecond,
            BandsOf(bytes[HeaderLength..], bandCount, frameCount)
        );
    }

    [Pure]
    private static float[][] BandsOf(ReadOnlySpan<byte> values, int bandCount, int frameCount)
    {
        var bands = new float[bandCount][];
        for (var band = 0; band < bandCount; band++)
        {
            bands[band] = new float[frameCount];
            for (var frame = 0; frame < frameCount; frame++)
                bands[band][frame] = (float)
                    BinaryPrimitives.ReadHalfLittleEndian(
                        values[((band * frameCount + frame) * ValueLength)..]
                    );
        }

        return bands;
    }

    [Pure]
    private static float[] FramesOf(float[] band, int first, int length)
    {
        var frames = new float[length];
        var from = Math.Clamp(first, 0, band.Length);
        var to = Math.Clamp(first + length, from, band.Length);
        if (to > from)
            band.AsSpan(from, to - from).CopyTo(frames.AsSpan(from - first));
        return frames;
    }

    [Pure]
    private static float[] Standardised(float[] values)
    {
        if (values.Length == 0)
            return values;

        var mean = values.Average();
        var deviation = Math.Sqrt(values.Average(value => (value - mean) * (value - mean)));
        return deviation <= 0
            ? new float[values.Length]
            : [.. values.Select(value => (float)((value - mean) / deviation))];
    }
}
