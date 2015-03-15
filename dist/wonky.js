/* wonky.js
 *
 * Random distribution sampling in JavaScript
 *
 * Probably a bad idea.
 *
 */

Wonky = (function(){

    // General sampling algorithm for sample size n
    var sampler = function(n, pdf, interval) {
        var sample = [];
        // TODO - web worker to run this asynchronously
        while(sample.length < n) {
            var candidate = interval(Math.random());
            if(Math.random() <= pdf(candidate)) {
                sample.push(candidate);
            }
        }
        return sample;
    }

    // Normal Distribution
    var normalFactory = function(mu, sigsq) {
        var mu = mu;
        var sigsq = sigsq;
        var pdf = function(x){
            var normconst = (1/(Math.sqrt(sigsq * 2 * Math.PI)));
            var core = Math.exp((-1/2)*Math.pow(((x - mu)/Math.sqrt(sigsq)),2));
            return normconst * core;
        }

        // Mapping from U(0,1) to a subset of the pdf's support, within
        // four standard deviations
        var support = function(u){
            // Map from (0,1) -> (-1, 1)
            var std_range = (u * 2) - 1;
            // Map from Z to X
            return (std_range * Math.sqrt(sigsq) * 4) + mu;
        }

        return {
            mean: mu,
            variance: sigsq,
            sd: Math.sqrt(sigsq),
            sample: function(n) {
                        return sampler(n, pdf, support);
            }
        }
    }

    // Exposed methods
    return {
        normal: normalFactory
    }


})();
