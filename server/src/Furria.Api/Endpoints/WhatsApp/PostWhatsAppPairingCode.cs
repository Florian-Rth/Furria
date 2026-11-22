using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class PostWhatsAppPairingCode
    : Endpoint<PostWhatsAppPairingCodeRequest, PostWhatsAppPairingCodeResponse>
{
    private readonly WhatsAppConnectionService _connection;

    public PostWhatsAppPairingCode(WhatsAppConnectionService connection)
    {
        _connection = connection;
    }

    public override void Configure()
    {
        Post("system/whatsapp/pairing-code");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(PostWhatsAppPairingCodeRequest req, CancellationToken ct)
    {
        var code = await _connection.PairingCodeAsync(req.PhoneNumber, ct);
        if (!code.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(code.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostWhatsAppPairingCodeResponse { Code = code.Value },
            cancellation: ct
        );
    }
}

public sealed record PostWhatsAppPairingCodeRequest
{
    public required string PhoneNumber { get; init; }
}

public sealed record PostWhatsAppPairingCodeResponse
{
    public required string Code { get; init; }
}

public sealed class PostWhatsAppPairingCodeValidator : Validator<PostWhatsAppPairingCodeRequest>
{
    private const int LongestInput = 32;

    public PostWhatsAppPairingCodeValidator()
    {
        RuleFor(request => request.PhoneNumber)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(LongestInput)
            .Must(phoneNumber =>
                WhatsAppPhoneNumbers.InternationalDigitsOf(phoneNumber) is not null
            )
            .WithMessage(WhatsAppPhoneNumbers.InvalidMessage);
    }
}
