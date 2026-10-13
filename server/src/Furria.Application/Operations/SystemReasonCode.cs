namespace Furria.Application.Operations;

public enum SystemReasonCode
{
    DatabaseUnreachable = 1,
    PendingMigrations = 2,
    SlowDatabase = 3,
    WorkerStale = 4,
    NoLiveWorker = 5,
    WorkerVersionMismatch = 6,
    QueueWaiting = 7,
    DiskLow = 8,
    StorageUnmeasured = 9,
    MediaFailed = 10,
    ErrorsLogged = 11,
    ErrorBurst = 12,
    ServiceOverdue = 13,
    ServiceFailed = 14,
    MailRetrying = 15,
    MailStuck = 16,
}
