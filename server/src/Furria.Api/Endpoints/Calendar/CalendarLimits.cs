namespace Furria.Api.Endpoints.Calendar;

internal static class CalendarLimits
{
    internal const int DefaultWindowDays = 120;
    internal const int MaxWindowDays = 400;
    internal const int TitleLength = 120;
    internal const int DescriptionLength = 2_000;
    internal const int PollQuestionLength = 200;
    internal const int PollOptionLabelLength = 120;
    internal const int PollMinOptions = 2;
    internal const int PollMaxOptions = 20;
    internal const int MaxAddOns = 30;
}
