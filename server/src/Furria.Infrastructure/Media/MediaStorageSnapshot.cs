using Furria.Application.Operations;

namespace Furria.Infrastructure.Media;

public sealed class MediaStorageSnapshot
{
    private StorageSurveyDetails? _latest;

    public StorageSurveyDetails? Latest => Volatile.Read(ref _latest);

    public void Record(StorageSurveyDetails survey) => Volatile.Write(ref _latest, survey);
}
