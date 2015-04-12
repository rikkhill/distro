// Tests for dots.js

// Custom assert for checking if values fall within error margins
QUnit.assert.closeEnough = function(value, expected, margin, message) {
    var diff = Math.abs(value - expected);
    this.push(diff < margin, value, expected, message);
}

// Take a sample of size 10000 from a given distribution, and return the sample,
// along with the mean and standard deviation of the sample
function takeSample(distribution) {
    var sample = distribution.sample(10000);
    return {
        mean    : Stat.mean(sample),
        sd      : Stat.sd(sample),
        values  : sample
    }
}

// Probably wants a better name - takes a sample, along with the mean and sd,
// and returns the cumulative proportion of the samples within one, two and
// three standard deviations of the mean
function getThreeSigmas (sample, mean, sd) {
    var i, one_sd = 0.0, two_sd = 0.0, three_sd = 0.0;
    var size = sample.length;
    for (i in sample) {
        if( Math.abs( sample[i] - mean ) < (1 * sd) ) { one_sd++; }
        if( Math.abs( sample[i] - mean ) < (2 * sd) ) { two_sd++; }
        if( Math.abs( sample[i] - mean ) < (3 * sd) ) { three_sd++; }
    }

    return [ one_sd / size, two_sd / size, three_sd / size ];

}

QUnit.module("Stat functions");
QUnit.test( "Basic statistics", function(assert) {

    assert.equal(Stat.mean([12345,67890,98765,43210]), 55552.5, "Arithmetic mean");

    assert.equal(Stat.sd([12345,67890,98765,43210]), 31775.617322878246, "(Population) Standard Deviation");
});

QUnit.test( "Advanced functions", function(assert) {

    assert.equal(Stat.choose(10,3), 120, "Binomial coefficient");

    var factorials  = [
        1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800
    ];

    var calculated_factorials = [];
    Array.apply(0, Array(11)).forEach(function(m,i,a) {
        calculated_factorials.push(Stat.fact(i));
    });
    assert.deepEqual(calculated_factorials, factorials, "Factorial function");

    var calculated_gammas = []
    Array.apply(0, Array(11)).forEach(function(m,i,a) {
                calculated_gammas.push(Stat.gamma(i + 1));
    });

    calculated_gammas = calculated_gammas.map(function(x){
        return parseInt(parseFloat(x).toFixed(2));
    });
    assert.deepEqual(calculated_gammas, factorials, "Gamma functiion");

});


QUnit.module("Distributions");
// Test if random standard normal distribution behaves as expected
QUnit.test( "Standard Normal Distribution", function(assert) {

    var mean = 0;
    var sd = 1;
    var standardNormal = Dist.normal(mean, Math.pow(sd,2));
    var sample = takeSample(standardNormal);
    var sigmas = getThreeSigmas(sample.values, sample.mean, sample.sd);
    assert.closeEnough(sigmas[0], 0.68, 0.02, "First SD ~ 0.68");
    assert.closeEnough(sigmas[1], 0.95, 0.02, "Second SD ~ 0.95");
    assert.closeEnough(sigmas[2], 0.997, 0.02, "Third SD ~ 0.997");

    assert.closeEnough(sample.mean, mean, 0.06, "Mean ~ " + mean);
    assert.closeEnough(sample.sd, sd, 0.06, "Overall SD ~ " + sd);
});

// Test if random general normal distribution behaves as expected
QUnit.test('Parametrised Normal Distribution', function(assert) {

    var mean = 10.0;
    var sd = 2.5;
    var parametricNormal = Dist.normal(mean, Math.pow(sd,2));
    var sample = takeSample(parametricNormal);
    var sigmas = getThreeSigmas(sample.values, sample.mean, sample.sd);
    assert.closeEnough(sigmas[0], 0.68, 0.02, "First SD ~ 0.68");
    assert.closeEnough(sigmas[1], 0.95, 0.02, "Second SD ~ 0.95");
    assert.closeEnough(sigmas[2], 0.997, 0.02, "Third SD ~ 0.997");

    assert.closeEnough(sample.mean, mean, 0.06, "Mean ~ " + mean);
    assert.closeEnough(sample.sd, sd, 0.06, "Overall SD ~ " + sd);
});

// Test if Poisson distribution behaves as expected
QUnit.test('Poisson(10) distribution', function(assert) {

    var lambda = 10;
    var poisson = Dist.poisson(lambda);
    var sample = takeSample(poisson);
    // Check index of dispersion = 1
    var index_of_dispersion = Math.pow(Stat.sd(sample.values), 2) / Stat.mean(sample.values);
    assert.closeEnough(sample.mean, lambda, 0.12, "Mean ~ " + lambda);
    assert.closeEnough(index_of_dispersion, 1, 0.04, "Index of dispersion ~ 1");
});

QUnit.test('Poisson(50) distribution', function(assert) {

    var lambda = 50;
    var poisson = Dist.poisson(lambda);
    var sample = takeSample(poisson);
    // Check index of dispersion = 1
    var index_of_dispersion = Math.pow(Stat.sd(sample.values), 2) / Stat.mean(sample.values);
    assert.closeEnough(sample.mean, lambda, 0.12, "Mean ~ " + lambda);
    assert.closeEnough(index_of_dispersion, 1, 0.04, "Index of dispersion ~ 1");
});

QUnit.test('Binomial(40, 0.6) distribution', function(assert) {

    var n = 40, p = 0.6;
    var binom = Dist.B(n, p);
    var sample = takeSample(binom);
    // Check MLE of p
    assert.closeEnough(sample.mean/n, p, 0.02, "Mean / n ~ " + p);
});

QUnit.test('Binomial(12, 0.05) distribution', function(assert) {

    var n = 12, p = 0.05;
    var binom = Dist.B(n, p);
    var sample = takeSample(binom);
    // Check MLE of p
    assert.closeEnough(sample.mean/n, p, 0.02, "Mean / n ~ " + p);
});

// MLEs for beta parameters
var beta_a = function(mean, variance) {
    return mean * ( ((mean * (1 - mean))/variance) - 1  );
}

var beta_b = function(mean, variance) {
    return (1 - mean) * (((mean * (1 - mean))/variance) - 1);
}

QUnit.test('Beta(2, 2) distribution', function(assert) {

    var a = 2, b = 2;
    var beta = Dist.beta(a, b);
    var sample = takeSample(beta);
    var a_estimate = beta_a(sample.mean, Math.pow(sample.sd, 2));
    var b_estimate = beta_b(sample.mean, Math.pow(sample.sd, 2));
    assert.closeEnough(a_estimate, a, 0.06, "parameter a estimate is okay");
    assert.closeEnough(b_estimate, b, 0.06, "parameter b estimate is okay");
});

QUnit.test('Beta(5, 12) distribution', function(assert) {

    var a = 5, b = 12;
    var beta = Dist.beta(a, b);
    var sample = takeSample(beta);
    var a_estimate = beta_a(sample.mean, Math.pow(sample.sd, 2));
    var b_estimate = beta_b(sample.mean, Math.pow(sample.sd, 2));
    assert.closeEnough(a_estimate, a, 0.06, "parameter a estimate is okay");
    assert.closeEnough(b_estimate, b, 0.06, "parameter b estimate is okay");
});
