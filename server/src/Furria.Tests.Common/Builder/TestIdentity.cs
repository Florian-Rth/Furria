using System.Net.Http.Headers;
using System.Net.Http.Json;
using Furria.Api.Endpoints.Auth;

namespace Furria.Tests.Common.Builder;

public sealed class TestIdentity
{
    private const string LoginRoute = "/api/auth/login";

    private readonly Func<HttpClient> _clientFactory;
    private readonly IReadOnlyDictionary<string, string> _emails;
    private readonly string _password;
    private readonly Dictionary<string, HttpClient> _clients = new(StringComparer.Ordinal);

    public AliasRegistry<int> People { get; }

    public AliasRegistry<int> Accounts { get; }

    public SeededAccount BootstrapAdmin { get; }

    internal TestIdentity(
        Func<HttpClient> clientFactory,
        SeededIdentity seeded,
        SeededAccount bootstrapAdmin,
        string password
    )
    {
        _clientFactory = clientFactory;
        _emails = seeded.AccountEmails;
        _password = password;
        BootstrapAdmin = bootstrapAdmin;
        People = new AliasRegistry<int>("Person", seeded.PersonIds);
        Accounts = new AliasRegistry<int>("Account", seeded.AccountIds);
    }

    public string EmailOf(string alias)
    {
        if (_emails.TryGetValue(alias, out var email))
            return email;

        var declared = _emails.Count == 0 ? "(none)" : string.Join(", ", _emails.Keys);
        throw new KeyNotFoundException(
            $"Unknown Account alias \"{alias}\". Declared Account aliases: {declared}."
        );
    }

    public async Task<HttpClient> ClientForAsync(string alias, CancellationToken ct = default)
    {
        if (_clients.TryGetValue(alias, out var cached))
            return cached;

        var client = await AuthenticateAsync(EmailOf(alias), _password, ct);
        _clients[alias] = client;
        return client;
    }

    public Task<HttpClient> BootstrapAdminClientAsync(CancellationToken ct = default) =>
        AuthenticateAsync(BootstrapAdmin.Email, BootstrapAdmin.Password, ct);

    public async Task<LoginResponse> LogInAsync(
        string email,
        string password,
        CancellationToken ct = default
    )
    {
        var client = _clientFactory();
        var response = await client.PostAsJsonAsync(
            LoginRoute,
            new LoginRequest { Email = email, Password = password },
            ct
        );

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<LoginResponse>(ct)
            ?? throw new InvalidOperationException($"{LoginRoute} returned an empty body.");
    }

    private async Task<HttpClient> AuthenticateAsync(
        string email,
        string password,
        CancellationToken ct
    )
    {
        var session = await LogInAsync(email, password, ct);
        var client = _clientFactory();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            session.AccessToken
        );

        return client;
    }
}
