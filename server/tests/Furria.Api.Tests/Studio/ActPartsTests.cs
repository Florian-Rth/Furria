using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class ActPartsTests
{
    private static readonly StepTiling Steps = new(
        [
            new StepSpan(1, 0, 10),
            new StepSpan(2, 10, 20),
            new StepSpan(3, 20, 30),
            new StepSpan(4, 30, 40),
        ],
        [9]
    );

    [Fact]
    public void Should_GroupTheStepsWithoutGaps_When_PartsBeginOnSteps()
    {
        var tiling = ActParts.Tile(Steps, [new PartStart(20, 3), new PartStart(10, 1)]);

        Assert.Equal(
            [
                [1, 2],
                [3, 4],
            ],
            tiling.Spans.Select(span => span.StepIds.ToArray()).ToArray()
        );
        Assert.Equal([10, 20], tiling.Spans.Select(span => span.PartId));
    }

    [Fact]
    public void Should_StretchTheFirstPartToTheFirstStep_When_ItBeginsLater()
    {
        var tiling = ActParts.Tile(Steps, [new PartStart(10, 2), new PartStart(20, 4)]);

        Assert.Equal(
            [
                [1, 2, 3],
                [4],
            ],
            tiling.Spans.Select(span => span.StepIds.ToArray()).ToArray()
        );
    }

    [Fact]
    public void Should_SetThePartAdrift_When_ItsFirstStepLeftTheMusic()
    {
        var tiling = ActParts.Tile(Steps, [new PartStart(10, 1), new PartStart(20, 9)]);

        Assert.Equal([10], tiling.Spans.Select(span => span.PartId));
        Assert.Equal([20], tiling.AdriftPartIds);
    }
}
