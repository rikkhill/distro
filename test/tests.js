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

    assert.equal(55552.5, Stat.mean([12345,67890,98765,43210]) , "Arithmetic mean");

    assert.equal(31775.617322878246, Stat.sd([12345,67890,98765,43210]) ,"(Population) Standard Deviation");

    assert.equal(120, Stat.choose(10,3), "Binomial coefficient");
});

QUnit.test( "Advanced functions", function(assert) {

    var factorials  = [
        1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800
    ];

    var calculated_factorials = [];
    Array.apply(0, Array(11)).forEach(function(m,i,a) {
        calculated_factorials.push(Stat.fact(i));
    });
    assert.deepEqual(factorials, calculated_factorials, "Factorial function");

    var calculated_gammas = []
    Array.apply(0, Array(11)).forEach(function(m,i,a) {
                calculated_gammas.push(Stat.gamma(i + 1));
    });

    calculated_gammas = calculated_gammas.map(function(x){
        return parseInt(parseFloat(x).toFixed(2));
    });
    assert.deepEqual(factorials, calculated_gammas, "Gamma functiion");

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
QUnit.skip('Poisson(10) distribution', function(assert) {

    var lambda = 10;
    var poisson = Dist.poisson(lambda);
    // Check index of dispersion = 1
});
