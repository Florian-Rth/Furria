namespace Furria.Application.Operations;

public enum BackgroundJob
{
    AbandonedUploadSweep = 1,
    MediaFileReaper = 2,
    GalleryBinPurge = 3,
    MailDispatcher = 4,
    UnconfirmedApplicationPurge = 5,
    SignedOutMailRequestWorker = 7,
    LogEntryPurge = 8,
    MediaStorageSurvey = 9,
    ActCastFreeze = 10,
}
