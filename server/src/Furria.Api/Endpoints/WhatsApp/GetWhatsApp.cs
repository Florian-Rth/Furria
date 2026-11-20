using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class GetWhatsApp : EndpointWithoutRequest<GetWhatsAppResponse>
{
    private readonly WhatsAppConnectionService _connection;

    public GetWhatsApp(WhatsAppConnectionService connection)
    {
        _connection = connection;
    }

    public override void Configure()
    {
        Get("system/whatsapp");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var overview = await _connection.OverviewAsync(ct);

        await Send.OkAsync(ToResponse(overview), cancellation: ct);
    }

    private static GetWhatsAppResponse ToResponse(WhatsAppOverviewDetails overview) =>
        new()
        {
            State = overview.State,
            BotPhone = overview.BotPhone,
            ClubChatId = overview.ClubChatId,
            Groups = [.. overview.Groups.Select(ToDto)],
        };

    private static WhatsAppGroupSummaryDto ToDto(WhatsAppGroupSummary group) =>
        new() { ChatId = group.ChatId, Name = group.Name };
}

public sealed record GetWhatsAppResponse
{
    public required WhatsAppConnectionState State { get; init; }

    public required string? BotPhone { get; init; }

    public required string? ClubChatId { get; init; }

    public required IReadOnlyList<WhatsAppGroupSummaryDto> Groups { get; init; }
}

public sealed record WhatsAppGroupSummaryDto
{
    public required string ChatId { get; init; }

    public required string Name { get; init; }
}
