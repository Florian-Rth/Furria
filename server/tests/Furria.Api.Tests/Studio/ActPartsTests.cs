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

    [Theory]
    [InlineData(20, 3, 4)]
    [InlineData(10, 2, 1)]
    [InlineData(20, 9, 3)]
    [InlineData(30, 3, null)]
    public void Should_HandThePartToAnotherOfItsSteps_When_ItsStoredFirstStepGoes(
        int partId,
        int removedStepId,
        int? expected
    )
    {
        var tiling = ActParts.Tile(Steps, [new PartStart(10, 2), new PartStart(20, 3)]);

        Assert.Equal(expected, ActParts.HeirOf(tiling, partId, removedStepId));
    }

    [Theory]
    [InlineData(20, 2, null)]
    [InlineData(20, 1, PartMoveRefusal.BeyondANeighbour)]
    [InlineData(20, 4, PartMoveRefusal.BeyondANeighbour)]
    [InlineData(10, 2, PartMoveRefusal.FirstPart)]
    [InlineData(20, 9, PartMoveRefusal.Adrift)]
    [InlineData(40, 2, PartMoveRefusal.Adrift)]
    public void Should_MoveAPartsStartOnlyBetweenItsNeighbours_When_ItsBorderIsMoved(
        int partId,
        int stepId,
        PartMoveRefusal? expected
    )
    {
        var tiling = ActParts.Tile(
            Steps,
            [new PartStart(10, 1), new PartStart(20, 3), new PartStart(30, 4), new PartStart(40, 9)]
        );

        Assert.Equal(expected, ActParts.RefusalToStartAt(Steps, tiling, partId, stepId));
    }

    [Theory]
    [InlineData(1, true)]
    [InlineData(2, false)]
    [InlineData(3, true)]
    public void Should_TellWhereAPartBegins_When_TheStepsAreGrouped(int stepId, bool expected)
    {
        var tiling = ActParts.Tile(Steps, [new PartStart(10, 2), new PartStart(20, 3)]);

        Assert.Equal(expected, ActParts.StartsAPart(tiling, stepId));
    }
}
