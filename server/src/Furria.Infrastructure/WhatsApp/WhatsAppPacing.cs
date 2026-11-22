using Furria.Application.WhatsApp;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppPacing
{
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;
    private readonly Lock _lock = new();
    private int _rateSignalsInARow;
    private DateTimeOffset _pausedUntil = DateTimeOffset.MinValue;

    public WhatsAppPacing(IOptions<WhatsAppOptions> options, TimeProvider timeProvider)
    {
        _options = options;
        _timeProvider = timeProvider;
    }

    public bool IsPaused
    {
        get
        {
            lock (_lock)
                return _timeProvider.GetUtcNow() < _pausedUntil;
        }
    }

    public TimeSpan GapAfterSend()
    {
        lock (_lock)
            _rateSignalsInARow = 0;

        var jitter = _options.Value.SendGapJitter;
        return _options.Value.SendGap
            + TimeSpan.FromTicks((long)(jitter.Ticks * Random.Shared.NextDouble()));
    }

    public TimeSpan BackOff()
    {
        lock (_lock)
        {
            _rateSignalsInARow++;
            var backOff = WhatsAppOutboxRetrySchedule.RateBackOffAfter(_rateSignalsInARow);
            _pausedUntil = _timeProvider.GetUtcNow() + backOff;
            return backOff;
        }
    }
}
