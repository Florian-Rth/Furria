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
    public void Should_GroupOnlyTheStepsInsideEachRange_When_StepsStayUngrouped()
    {
        var tiling = ActParts.Group(Steps, [new PartRange(20, 4, 4), new PartRange(10, 2, 3)]);

        Assert.Equal(
            [
                [2, 3],
                [4],
            ],
            tiling.Spans.Select(span => span.StepIds.ToArray()).ToArray()
        );
        Assert.Equal([10, 20], tiling.Spans.Select(span => span.PartId));
    }

    [Theory]
    [InlineData(9, 2)]
    [InlineData(1, 9)]
    public void Should_SetThePartAdrift_When_OneOfItsEndsLeftTheMusic(int first, int last)
    {
        var tiling = ActParts.Group(
            Steps,
            [new PartRange(10, 1, 1), new PartRange(20, first, last)]
        );

        Assert.Equal([10], tiling.Spans.Select(span => span.PartId));
        Assert.Equal([20], tiling.AdriftPartIds);
    }

    [Fact]
    public void Should_YieldTheStepsToTheEarlierPart_When_StoredRangesOverlap()
    {
        var tiling = ActParts.Group(
            Steps,
            [new PartRange(10, 1, 3), new PartRange(20, 2, 4), new PartRange(30, 3, 3)]
        );

        Assert.Equal(
            [
                [1, 2, 3],
                [4],
            ],
            tiling.Spans.Select(span => span.StepIds.ToArray()).ToArray()
        );
        Assert.Equal([30], tiling.AdriftPartIds);
    }

    [Theory]
    [InlineData(0, 1, 1, null)]
    [InlineData(0, 4, 4, null)]
    [InlineData(10, 1, 3, null)]
    [InlineData(0, 3, 2, PartRangeRefusal.Reversed)]
    [InlineData(0, 1, 2, PartRangeRefusal.Overlapping)]
    [InlineData(0, 3, 4, PartRangeRefusal.Overlapping)]
    [InlineData(0, 1, 9, PartRangeRefusal.Adrift)]
    public void Should_AcceptOnlyAnOrderedRangeOverFreeSteps_When_APartIsRanged(
        int partId,
        int first,
        int last,
        PartRangeRefusal? expected
    )
    {
        var tiling = ActParts.Group(Steps, [new PartRange(10, 2, 3)]);

        Assert.Equal(
            expected,
            ActParts.RefusalOf(Steps, tiling, new PartRange(partId, first, last))
        );
    }

    [Theory]
    [InlineData(2, 3, 4)]
    [InlineData(4, 2, 3)]
    [InlineData(3, 2, 4)]
    public void Should_ShrinkTheRange_When_OneOfItsStepsGoes(int removed, int first, int last)
    {
        var part = new PartRange(10, 2, 4);
        var tiling = ActParts.Group(Steps, [part]);

        Assert.Equal(new PartRange(10, first, last), ActParts.Without(tiling, part, removed));
    }

    [Fact]
    public void Should_RemoveThePart_When_ItsOnlyStepGoes()
    {
        var part = new PartRange(10, 3, 3);
        var tiling = ActParts.Group(Steps, [part]);

        Assert.Null(ActParts.Without(tiling, part, 3));
    }

    [Fact]
    public void Should_KeepTheAdriftPartOnItsOtherEnd_When_OneOfItsEndsGoes()
    {
        var part = new PartRange(10, 2, 9);
        var tiling = ActParts.Group(Steps, [part]);

        Assert.Equal(new PartRange(10, 9, 9), ActParts.Without(tiling, part, 2));
    }

    [Theory]
    [InlineData(3, 1)]
    [InlineData(2, 0)]
    [InlineData(4, 0)]
    public void Should_ReachIntoTheNewStep_When_ThePartsLastStepIsSplit(
        int splitStepId,
        int reaching
    )
    {
        var tiling = ActParts.Group(Steps, [new PartRange(10, 2, 3)]);

        var ranges = ActParts.ReachingInto(tiling, splitStepId, 50);

        Assert.Equal(reaching, ranges.Count);
        Assert.All(ranges, range => Assert.Equal(new PartRange(10, 2, 50), range));
    }
}
