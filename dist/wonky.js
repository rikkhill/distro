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

    // Using the Lanczos approximation of the Gamma function
    // We'll calculate a cached set of coefficients for a default gamma
    // function, and then expose a method to change that precision if required

    // For precomputing Lanczos coefficients
    var lanczos_p = function(k, g){
        var outer_term = Math.pow(-1, k) * Math.sqrt(2/Math.PI);
        outer_term *= k * Math.exp(g);

        var sig_term = 0;
        to_n(k).forEach(function(j,i,range) {
            var inner_term = Math.pow(-1, j);
            inner_term *= fact(j + k - 1) / (fact(k - j) * fact(j));
            inner_term *= Math.pow(Math.E / j + g + 0.5, j + 0.5);
            sig_term += inner_term;
        });
        return outer_term * sig_term;
    }

    // return a Gamma function approximation of precision g
    var makeGamma = function(g) {
        // Ten terms of Lanczos coefficients to precision g
        var c = [0].concat(to_n(9)).map(function(x) {
           return lanczos_p(x, g);
        });

        console.log(c);

        var gamma = function(x) {
            z = x - 1;
            var A_term = c[0]; // We'll sum the A_g term here
            to_n(9).forEach(function(i, j, range) {
                A_term += c[i] / (z + i);
            });

            var g_term = Math.sqrt(2 * Math.PI) * Math.pow(z + g + 0.5,z + 0.5);
            g_term *= Math.exp(-z -g -0.5);

            return g_term * A_term;
        }

        return gamma;
    }




    // Exposed methods
    return {
        mean    : mean,
        sd      : sd,
        fact    : fact,
        gamma   : makeGamma(7),
        setGamma: function(g) {self.gamma = makeGamma(g)},
        to_n    : to_n
    }
})();

// Distributions
Dist = (function(){

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
