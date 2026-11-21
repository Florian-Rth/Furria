using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class GetWhatsApp : EndpointWithoutRequest<GetWhatsAppResponse>
{
    private readonly WhatsAppConnectionService _connection;
    private readonly WhatsAppGroupAddQuery _groupAdds;

    public GetWhatsApp(WhatsAppConnectionService connection, WhatsAppGroupAddQuery groupAdds)
    {
        _connection = connection;
        _groupAdds = groupAdds;
    }

    public override void Configure()
    {
        Get("system/whatsapp");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var overview = await _connection.OverviewAsync(ct);
        var refusedAdds = await _groupAdds.RefusedAddsAsync(ct);

        await Send.OkAsync(ToResponse(overview, refusedAdds), cancellation: ct);
    }

    private static GetWhatsAppResponse ToResponse(
        WhatsAppOverviewDetails overview,
        IReadOnlyList<WhatsAppRefusedAddSummary> refusedAdds
    ) =>
        new()
        {
            State = overview.State,
            BotPhone = overview.BotPhone,
            ClubChatId = overview.ClubGroup?.ChatId,
            KeepsClubGroup = overview.ClubGroup?.KeepsMembers ?? false,
            ClubGroupInviteLink = overview.ClubGroup?.InviteLink,
            Groups = [.. overview.Groups.Select(ToDto)],
            RefusedAdds = [.. refusedAdds.Select(ToDto)],
        };

    private static WhatsAppRefusedAddSummaryDto ToDto(WhatsAppRefusedAddSummary add) =>
        new()
        {
            PersonId = add.PersonId,
            FirstName = add.FirstName,
            LastName = add.LastName,
            Phone = add.Phone,
            RefusedAt = add.RefusedAt,
        };

    private static WhatsAppGroupSummaryDto ToDto(WhatsAppGroupSummary group) =>
        new() { ChatId = group.ChatId, Name = group.Name };
}

public sealed record GetWhatsAppResponse
{
    public required WhatsAppConnectionState State { get; init; }

    public required string? BotPhone { get; init; }

    public required string? ClubChatId { get; init; }

    public required bool KeepsClubGroup { get; init; }

    public required string? ClubGroupInviteLink { get; init; }

    public required IReadOnlyList<WhatsAppGroupSummaryDto> Groups { get; init; }

    public required IReadOnlyList<WhatsAppRefusedAddSummaryDto> RefusedAdds { get; init; }
}

public sealed record WhatsAppGroupSummaryDto
{
    public required string ChatId { get; init; }

    public required string Name { get; init; }
}

public sealed record WhatsAppRefusedAddSummaryDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Phone { get; init; }

    public required DateTimeOffset RefusedAt { get; init; }
}
