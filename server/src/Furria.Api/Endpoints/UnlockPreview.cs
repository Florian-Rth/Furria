using FastEndpoints;
using FluentValidation;
using Furria.Application.PreviewAccess;

namespace Furria.Api.Endpoints;

public sealed class UnlockPreview : Endpoint<UnlockPreviewRequest, UnlockPreviewResponse>
{
    private readonly IPreviewAccessService _previewAccessService;

    public UnlockPreview(IPreviewAccessService previewAccessService)
    {
        _previewAccessService = previewAccessService;
    }

    public override void Configure()
    {
        Post("preview/unlock");
        AllowAnonymous();
    }

    public override async Task HandleAsync(UnlockPreviewRequest req, CancellationToken ct)
    {
        if (!_previewAccessService.ValidatePassword(req.Password))
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await Send.OkAsync(new UnlockPreviewResponse { Granted = true }, cancellation: ct);
    }
}

public sealed class UnlockPreviewRequest
{
    public required string Password { get; init; }
}

public sealed class UnlockPreviewValidator : Validator<UnlockPreviewRequest>
{
    public UnlockPreviewValidator()
    {
        RuleFor(request => request.Password).NotEmpty();
    }
}

public sealed record UnlockPreviewResponse
{
    public required bool Granted { get; init; }
}
