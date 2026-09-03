namespace Furria.Application.Authorization;

public sealed class PermissionAuthorizer
{
    public Task<bool> IsGrantedAsync(int accountId, string permissionKey, CancellationToken ct) =>
        Task.FromResult(false);
}
