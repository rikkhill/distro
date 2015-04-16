# wonky
Rejection sampling for common probability distributions in JavaScript.

I have occasionally needed values sampled from a specific distribution in JavaScript, but haven't found any lightweight libraries for doing this. wonky.js implements rejection sampling for common probability distributions (including various members of the natural exponential family, for which inverse transform sampling won't work).

Currently implemented distributions:

- Normal
- Poisson
- Binomial
- Beta
