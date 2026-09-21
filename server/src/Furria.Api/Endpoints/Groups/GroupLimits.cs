namespace Furria.Api.Endpoints.Groups;

internal static class GroupLimits
{
    internal const int NameLength = 80;
    internal const int DescriptionLength = 400;
    internal const int KindNameLength = 80;
    internal const int MinSortOrder = 1;
    internal const int MaxSortOrder = 999;
    internal const int EarliestFoundedYear = 1800;
    internal const int LatestFoundedYear = 2100;
    internal const int MinTrainingDurationMinutes = 15;
    internal const int MaxTrainingDurationMinutes = 480;
    internal const int MaxTrainingSlots = 14;
    internal const int MaxTrainingTitleLength = 120;
}
