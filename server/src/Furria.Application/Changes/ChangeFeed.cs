namespace Furria.Application.Changes;

public sealed class ChangeFeed
{
    private readonly Lock _subscribersLock = new();
    private ChangeSubscription[] _subscribers = [];

    private void Unsubscribe(ChangeSubscription subscription)
    {
        lock (_subscribersLock)
            _subscribers = [.. _subscribers.Where(subscriber => subscriber != subscription)];
    }

    public ChangeSubscription Subscribe()
    {
        var subscription = new ChangeSubscription(Unsubscribe);
        lock (_subscribersLock)
            _subscribers = [.. _subscribers, subscription];

        return subscription;
    }

    public void Publish(ChangeBatch batch)
    {
        foreach (var subscriber in Volatile.Read(ref _subscribers))
            subscriber.Deliver(batch);
    }
}
