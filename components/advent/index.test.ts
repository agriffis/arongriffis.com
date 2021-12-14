import * as advent from '.'

const run = props =>
  (advent[`d${props.day}${props.part}`] || advent[`d${props.day}`])(props)

describe('d5', () => {
  const sample = `
0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2
`
  test('a sample', () =>
    expect(run({day: 5, part: 'a', input: sample})).toEqual(5))
  test('a input', () => expect(run({day: 5, part: 'a'})).toEqual(7473))
  test('b sample', () =>
    expect(run({day: 5, part: 'b', input: sample})).toEqual(12))
  test('b input', () => expect(run({day: 5, part: 'b'})).toEqual(24164))
})

describe('d6', () => {
  test('a sample', () =>
    expect(run({day: 6, part: 'a', input: '3,4,3,1,2'})).toEqual(5934))
  test('a input', () => expect(run({day: 6, part: 'a'})).toEqual(356190))
  test('b sample', () =>
    expect(run({day: 6, part: 'b', input: '3,4,3,1,2'})).toEqual(26984457539))
  test('b input', () => expect(run({day: 6, part: 'b'})).toEqual(1617359101538))
})

describe('d7', () => {
  test('a sample', () =>
    expect(run({day: 7, part: 'a', input: '16,1,2,0,4,2,7,1,2,14'})).toEqual(
      37,
    ))
  test('a input', () => expect(run({day: 7, part: 'a'})).toEqual(347509))
  test('b sample', () =>
    expect(run({day: 7, part: 'b', input: '16,1,2,0,4,2,7,1,2,14'})).toEqual(
      168,
    ))
  test('b input', () => expect(run({day: 7, part: 'b'})).toEqual(98257206))
})

describe('d8', () => {
  const short = `
acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab | cdfeb fcadb cdfeb cdbaf
`
  const long = `
be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
`
  test('a short', () =>
    expect(run({day: 8, part: 'a', input: short})).toEqual(0))
  test('a long', () =>
    expect(run({day: 8, part: 'a', input: long})).toEqual(26))
  test('a input', () => expect(run({day: 8, part: 'a'})).toEqual(274))
  test('b short', () =>
    expect(run({day: 8, part: 'b', input: short})).toEqual(5353))
  test('b long', () =>
    expect(run({day: 8, part: 'b', input: long})).toEqual(61229))
  test('b input', () => expect(run({day: 8, part: 'b'})).toEqual(1012089))
})

describe('d9', () => {
  const sample = `
2199943210
3987894921
9856789892
8767896789
9899965678
`
  test('a sample', () =>
    expect(run({day: 9, part: 'a', input: sample})).toEqual(15))
  test('a input', () => expect(run({day: 9, part: 'a'})).toEqual(458))
  test('b sample', () =>
    expect(run({day: 9, part: 'b', input: sample})).toEqual(1134))
  test('b input', () => expect(run({day: 9, part: 'b'})).toEqual(1391940))
})

describe('d10', () => {
  const sample = `
[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]
[[<[([]))<([[[[()]]]
[{[{(]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<))><([]([]()
<{([([[(<>())]>(<<{{
<{([{}[<[[[<>{}]]]>[]]
`
  test('a sample', () =>
    expect(run({day: 10, part: 'a', input: sample})).toEqual(26397))
  test('a input', () => expect(run({day: 10, part: 'a'})).toEqual(323613))
  test('b sample', () =>
    expect(run({day: 10, part: 'b', input: sample})).toEqual(288957))
  test('b input', () => expect(run({day: 10, part: 'b'})).toEqual(3103006161))
})

describe('d11', () => {
  const sample = `
5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526
`
  test('a sample', () =>
    expect(run({day: 11, part: 'a', input: sample})).toEqual(1656))
  test('a input', () => expect(run({day: 11, part: 'a'})).toEqual(1571))
  test('b sample', () =>
    expect(run({day: 11, part: 'b', input: sample})).toEqual(195))
  test('b input', () => expect(run({day: 11, part: 'b'})).toEqual(387))
})

describe('d12', () => {
  const example = `
start-A
start-b
A-c
A-b
b-d
A-end
b-end
`
  const slightlyLarger = `
  dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc
`
  const evenLarger = `
    fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW
    `
  test('a example', () =>
    expect(run({day: 12, part: 'a', input: example})).toEqual(10))
  test('a slightlyLarger', () =>
    expect(run({day: 12, part: 'a', input: slightlyLarger})).toEqual(19))
  test('a evenLarger', () =>
    expect(run({day: 12, part: 'a', input: evenLarger})).toEqual(226))
  test('a input', () => expect(run({day: 12, part: 'a'})).toEqual(3497))
  test('b example', () =>
    expect(run({day: 12, part: 'b', input: example})).toEqual(36))
  test('b slightlyLarger', () =>
    expect(run({day: 12, part: 'b', input: slightlyLarger})).toEqual(103))
  test('b evenLarger', () =>
    expect(run({day: 12, part: 'b', input: evenLarger})).toEqual(3509))
  test('b input', () => expect(run({day: 12, part: 'b'})).toEqual(93686))
})

describe('d13', () => {
  const example = `
6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5
`
  test('a example', () =>
    expect(run({day: 13, part: 'a', input: example})).toEqual(17))
  test('a input', () => expect(run({day: 13, part: 'a'})).toEqual(790))
  test('b example', () =>
    expect(run({day: 13, part: 'b', input: example})).toEqual(`\
#####
#...#
#...#
#...#
#####`))
  test('b input', () =>
    expect(run({day: 13, part: 'b'})).toEqual(`\
###...##..#..#.####.###..####...##..##.
#..#.#..#.#..#....#.#..#.#.......#.#..#
#..#.#....####...#..###..###.....#.#...
###..#.##.#..#..#...#..#.#.......#.#...
#....#..#.#..#.#....#..#.#....#..#.#..#
#.....###.#..#.####.###..#.....##...##.`))
})

describe('d14', () => {
  const example = `
NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C
`
  test('a example', () =>
    expect(run({day: 14, part: 'a', input: example})).toEqual(1588))
  test('a input', () => expect(run({day: 14, part: 'a'})).toEqual(2874))
  test('b example', () =>
    expect(run({day: 14, part: 'b', input: example})).toEqual(2188189693529))
  test('a input', () =>
    expect(run({day: 14, part: 'b'})).toEqual(5208377027195))
})
