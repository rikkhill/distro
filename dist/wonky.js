/* wonky.js
 *
 * Random distribution sampling in JavaScript
 *
 * Probably a bad idea.
 *
 */

Wonky = (function(){

    // Statistical helper functions
    var mean = function(sample) {
        var sum = sample.reduce(function(a,b){ return a + b  });
        return sum / sample.length;
    }

    var sd = function(sample) {
        var x_bar = mean(sample);
        var squareDiffs = sample.map(function(x){return Math.pow(x - x_bar,2)});
        return Math.sqrt(mean(squareDiffs));
    }

    // TODO: Gamma function

    // General sampling algorithm for sample size n
    var sampler = function(n, pdf, support) {
        var sample = [];
        // TODO - web worker to run this asynchronously
        while(sample.length < n) {
            var candidate = support(Math.random());
            if(Math.random() <= pdf(candidate)) {
                sample.push(candidate);
            }
        }
        return sample;
    }

    var distributionFactory = function(pdf, support) {
        var test_sample = sampler(10000, pdf, support);
        var mu = mean(test_sample);
        var sig = sd(test_sample);

        return {
            mean    : mu,
            sd      : sig,
            sample  : function(n) {
                return sampler(n, pdf, support);
            }
        }
    }


    // TODO: this is horrible. Make a dedicated distribution object that
    // instantiates from pdf and support, with optional summary statistics,
    // and if they're not included, the distributionFactory can infer them

    // Object containing pdf, support help and aliases for distributions
    var distributions = {
        normal  : {
            definition  : function(mu, sigsq) {
                var pdf = function(x) {
                    var normconst = (1/(Math.sqrt(sigsq * 2 * Math.PI)));
                    var core = Math.exp((-1/2) * Math.pow(((x - mu)/Math.sqrt(sigsq)),2));
                    return normconst * core;
                }
                var support = function(u) {
                // Returns a value from N's support, within 6 SDs of the mean
                    return ( ( ( u * 2  ) - 1  ) * Math.sqrt(sigsq) * 6  ) + mu;
                }

                return {
                    pdf: pdf,
                    support: support
                }
            },
            help    : "Normal distribution N(mean, variance)",
            aliases : ['N'],
        }
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
        // six standard deviations
        var support = function(u){
            // Map from (0,1) -> (-1, 1)
            var std_range = (u * 2) - 1;
            // Map from Z to X
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

    var help = {};
    var exposed_methods = {
        help    :   function(dist) {
                        return help[dist];
                    }
    };

    // Inject all distributions into exposed methods
    for (var d in distributions) {
        var factory = function(args) {
            var parts = distributions[d].definition.apply(this, arguments);
            // `parts` is now a specific instance of a distribution
            return distributionFactory(parts.pdf, parts.support);
        }

        var aliases = distributions[d].aliases;
        exposed_methods[d] = factory;
        for (var a in aliases) {
            exposed_methods[aliases[a]] = factory;
        }

        help[d] = distributions[d].help;
    }

    return exposed_methods;
})();
