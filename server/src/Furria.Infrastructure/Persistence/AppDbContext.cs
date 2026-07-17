using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public const string ConnectionName = "AppDb";

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
}
