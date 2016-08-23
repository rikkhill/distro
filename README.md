# wonky
Rejection sampling for common probability distributions in JavaScript.

I have occasionally needed values sampled from a specific distribution in JavaScript, but haven't found any lightweight libraries for doing this. wonky.js implements rejection sampling for common probability distributions (including various members of the natural exponential family, for which inverse transform sampling won't work).

Currently implemented distributions:

- Normal
- Poisson
- Binomial
- Beta
- Gamma
- Exponential

Example usage:

```javascript
// Standard normal
normDist = Dist.N(0, 1)
// 10 random samples from standard normal
sample = normDist.sample(10)

// Binomial distribution, 10 trials, p=0.5
binomDist = Dist.B(10, 0.5)
// Sample once
successes = binomDist(1)

```
