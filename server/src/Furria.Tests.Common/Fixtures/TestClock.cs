namespace Furria.Tests.Common.Fixtures;

public sealed class TestClock : TimeProvider
{
    private DateTimeOffset _utcNow;

    public TestClock(DateTimeOffset utcNow)
    {
        _utcNow = utcNow;
    }

    public override TimeZoneInfo LocalTimeZone => TimeZoneInfo.Utc;

    public override DateTimeOffset GetUtcNow() => _utcNow;

    public void Advance(TimeSpan ahead) => _utcNow = _utcNow.Add(ahead);

    public void SetUtcNow(DateTimeOffset utcNow) => _utcNow = utcNow;
}
