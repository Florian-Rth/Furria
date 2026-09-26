using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Invitations;
using Xunit;

namespace Furria.Api.Tests.Invitations;

internal static class InvitationRoundSteps
{
    public static readonly TimeSpan PastTheReminderDelay = TimeSpan.FromDays(4);

    public static readonly TimeSpan WithinTheReminderDelay = TimeSpan.FromDays(2);

    public static readonly TimeSpan PastTheMailLifetime = TimeSpan.FromDays(20);

    public static async Task<GetBulkInvitationPreviewResponse> PreviewAsync(HttpClient manager)
    {
        var (response, result) = await manager.GETAsync<
            GetBulkInvitationPreview,
            GetBulkInvitationPreviewResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    public static async Task<int> InviteAllAsync(HttpClient manager)
    {
        var (response, result) = await manager.POSTAsync<
            PostBulkInvitation,
            PostBulkInvitationResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result.SentCount;
    }

    public static async Task<int> RemindAllAsync(HttpClient manager)
    {
        var (response, result) = await manager.POSTAsync<
            PostInvitationReminders,
            PostInvitationRemindersResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result.SentCount;
    }
}
