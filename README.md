# Fauxbiotic

## SmoothLifeL implemented in WebGL

Still just messing around with shaders, idk lol

Production
----------

[GitHub Pages](https://jessechen.github.io/fauxbiotic/)

Prior Art
---------

* Original paper: [Generalization of Conway's "Game of Life" to a continuous domain - SmoothLife by Stephan Rafler](https://arxiv.org/abs/1111.1567) (2011)
  * r<sub>a</sub> = 21
  * r<sub>b</sub> = 7
  * 0.278 ≤ b ≤ 0.365
  * 0.267 ≤ d ≤ 0.445
  * α<sub>n</sub> = 0.028
  * α<sub>m</sub> = 0.147
  * dt = undefined

* Demonstration video: [SmoothLifeL by Tim Hutton](https://www.youtube.com/watch?v=KJe9H6qS82I) (2012)
  * r<sub>a</sub> = 20
  * r<sub>b</sub> = 6.667
  * 0.257 ≤ b ≤ 0.336
  * 0.365 ≤ d ≤ 0.549
  * α<sub>n</sub> = 0.028
  * α<sub>m</sub> = 0.147
  * dt = 0.05

* Blogpost with a much better explanation than the original paper: [Conway’s Game of Life for Curved Surfaces by Mikola Lysenko](https://0fps.net/2012/11/19/conways-game-of-life-for-curved-surfaces-part-1/) (2012)

* Original Game of Life in a fragment shader: [A GPU Approach to Conway's Game of Life by Chris Wellons](https://nullprogram.com/blog/2014/06/10/) (2014)

* Interactive demo: [SmoothLife(L) Shadertoy by chronos](https://www.shadertoy.com/view/XtdSDn) (2017)
  * r<sub>a</sub> = 10
  * r<sub>b</sub> = 3
  * 0.257 ≤ b ≤ 0.336
  * 0.365 ≤ d ≤ 0.549
  * α<sub>n</sub> = 0.028
  * α<sub>m</sub> = 0.147
  * dt = 0.30

Setup
-----

`python3 -m http.server`

License
-------

MIT