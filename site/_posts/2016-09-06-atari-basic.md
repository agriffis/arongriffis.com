---
title: Atari BASIC
excerpt: Memories of programming BASIC on the family Atari
author: Aron
tags: [atari, basic, math]
layout: article
---

When I was a kid, my family had an
[Atari 800](https://en.wikipedia.org/wiki/Atari_8-bit_family) computer.

<div class="post-image">
    <a title="Image by Bilby [CC BY 3.0], via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File%3AAtari_800.jpg">
        <img sizes="(min-width: 36em) 28em, 100vw"
             srcset="/img/1440/atari-800.jpg 1440w,
                     /img/1080/atari-800.jpg 1080w,
                     /img/1150/atari-800.jpg 1150w,
                     /img/720/atari-800.jpg 720w,
                     /img/575/atari-800.jpg 575w"
             src="/img/575/atari-800.jpg">
    </a>
</div>

I loved that computer, and I especially loved programming it in Atari BASIC.
When we took family trips, my parents would tell each of us kids to bring
something to read in the car, and I'd trot out carrying the [Atari BASIC
reference manual](https://archive.org/stream/atari-basic-reference-manual/ataribasicreferencemanual#page/n0/mode/2up).

<div class="post-image">
    <a title="Image by Vintage Computing and Gaming, used by permission" href="http://www.vintagecomputing.com/index.php/archives/815/retro-scan-of-the-week-father-and-son-at-the-atari">
        <img sizes="(min-width: 36em) 28em, 100vw"
             srcset="/img/1440/atari-800-basic-manual.jpg 1440w,
                     /img/1080/atari-800-basic-manual.jpg 1080w,
                     /img/1150/atari-800-basic-manual.jpg 1150w,
                     /img/720/atari-800-basic-manual.jpg 720w,
                     /img/575/atari-800-basic-manual.jpg 575w"
             src="/img/575/atari-800-basic-manual.jpg">
    </a>
</div>

I wrote programs to print my name and `GOTO 10` to make a dizzying pattern. I
saw [Zork](https://en.wikipedia.org/wiki/Zork) and tried to recreate it in
BASIC, but got lost in a maze of twisty little passages, all alike. I discovered
graphics mode and drew a spaceship with `PLOT` and `DRAWTO`, then learned to
`PEEK` for joystick input so I could move it around the screen.

One of my favorite programs drew a wave. I'd spend hours fiddling with the
numbers and watching the wave change shape, imagining that I was dialing in
the parameters for an important scientific experiment.

Recently I recalled the wave program and fired up the
[Atari++ emulator](http://www.xl-project.com/) to reconstruct it:

<div class="post-image">
    <video autoplay controls loop>
        <source src="/img/logo/wave.ogv" type="video/ogg; codecs=&quot;theora&quot;">
        <source src="/img/logo/wave.mp4" type="video/mp4; codecs=&quot;avc1.4d401f&quot;"><!-- works for iphone 4 -->
        <source src="/img/logo/wave.mp4"><!-- https://www.broken-links.com/2010/07/08/making-html5-video-work-on-android-phones/ -->
    </video>
</div>

It's been over thirty years since I wrote that originally! Funny how much
hasn't changed--I still love programming as much as I did back then.

Now if you'll excuse me, I need to dial in these parameters...

{% comment %}
<iframe width="560" height="315" src="https://www.youtube.com/embed/p4jNYkLAMLE" frameborder="0" allowfullscreen></iframe>

$$y = \sum_{\alpha = 0}^{x}(11 - \alpha)$$
{% endcomment %}
