/* wonky.js
 *
 * Random distribution sampling in JavaScript
 *
 * Probably a bad idea.
 *
 */



// Statistical functions
Stat = (function(){

    // arithmetic mean
    var mean = function(sample) {
        var sum = sample.reduce(function(a,b){ return a + b  });
        return sum / sample.length;
    }

    // standard deviation
    var sd = function(sample) {
        var x_bar = mean(sample);
        var squareDiffs = sample.map(function(x){return Math.pow(x - x_bar,2)});
        return Math.sqrt(mean(squareDiffs));
    }

    // to_n
    // returns an array of integers [1..n]
    // One day we'll get proper range generators in JavaScript
    var to_n = function(n) {
        if(n < 1) {
            return [];
        }
        return Array.apply(0, Array(n)).map(function(c,i,a){
            return i + 1;
        });
    }

    // factorial function
    var fact = function(n) {
        if(n == 0) {
            return 1;
        }

        return to_n(n).reduce(function(a,b){
            return a * b;
        }, 1);
    }

    // TODO: binomial coefficient / choose

    // Lanczos approximation (g=7, n=9) for the Gamma function
    // Should be precise enough for most JavaScript float purposes
    var gamma = function(z) {
        var c = [
            0.99999999999980993,
            676.5203681218851,
            -1259.1392167224028,
            771.32342877765313,
            -176.61502916214059,
            12.507343278686905,
            -0.13857109526572012,
            9.9843695780195716e-6,
            1.5056327351493116e-7
            ];
        g = 7;
        if(z < 0.5) {
            return Math.PI / (Math.sin(Math.PI * z) * gamma (1 - z));
        } else {
            z--;
            var s = c[0];
            to_n(8).forEach(function(i, j, a) {
                s += c[i] / (z + i);
            });

            var t = z + g + 0.5;
            return Math.sqrt(2 * Math.PI)*Math.pow(t, z + 0.5)*Math.exp(-t)*s;
        }
    }



    // Exposed methods
    return {
        mean    : mean,
        sd      : sd,
        fact    : fact,
        gamma   : gamma,
        setGamma: function(g) {self.gamma = makeGamma(g)},
        to_n    : to_n
    }
})();

// Distributions
Dist = (function(){

    // General sampling algorithm for sample size n
    var sampler = function(n, pdf, support) {
        var sample = [];
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
        var mu = Stat.mean(test_sample);
        var sig = Stat.sd(test_sample);

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
