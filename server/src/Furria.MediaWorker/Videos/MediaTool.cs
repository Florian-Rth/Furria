using System.Diagnostics;
using System.Text;
using Furria.MediaWorker.Renditions;

namespace Furria.MediaWorker.Videos;

public static class MediaTool
{
    private const int ReasonLength = 400;

    public static async Task<string> RunAsync(
        string program,
        IReadOnlyList<string> arguments,
        CancellationToken ct
    )
    {
        using var process = new Process { StartInfo = StartInfoOf(program, arguments) };
        try
        {
            process.Start();
        }
        catch (System.ComponentModel.Win32Exception exception)
        {
            throw new MediaRenderingException($"{program} could not be started", exception);
        }

        var output = process.StandardOutput.ReadToEndAsync(ct);
        var errors = process.StandardError.ReadToEndAsync(ct);
        try
        {
            await process.WaitForExitAsync(ct);
        }
        catch (OperationCanceledException)
        {
            process.Kill(entireProcessTree: true);
            throw;
        }

        if (process.ExitCode != 0)
            throw new MediaRenderingException(
                $"{program} exited with {process.ExitCode}: {Tail(await errors)}"
            );
        return await output;
    }

    private static ProcessStartInfo StartInfoOf(string program, IReadOnlyList<string> arguments)
    {
        var startInfo = new ProcessStartInfo(program)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8,
        };
        foreach (var argument in arguments)
            startInfo.ArgumentList.Add(argument);
        return startInfo;
    }

    private static string Tail(string errors)
    {
        var trimmed = errors.Trim();
        return trimmed.Length <= ReasonLength ? trimmed : trimmed[^ReasonLength..];
    }
}
