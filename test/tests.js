// Tests for dots.js

// Custom assert for checking if values fall within error margins
QUnit.assert.closeEnough = function(value, expected, margin, message) {
    var diff = Math.abs(value - expected);
    this.push(diff < margin, value, expected, message);
}

function mean(sample) {
    var sum = sample.reduce(function(a,b){ return a + b });
    return sum / sample.length;
}

function sd(sample) {
    var x_bar = mean(sample);
    var squareDiffs = sample.map(function(x){ return Math.pow(x - x_bar, 2) });
    return Math.sqrt(mean(squareDiffs));
}

function sampleDistribution (distribution, mean_val, sd_val) {
    var i, one_sd = 0.0, two_sd = 0.0, three_sd = 0.0;
    var mean_val = distribution.mean;
    var sd_val = distribution.sd;
    var sample = distribution.sample(10000);
    var size = sample.length;
    for (i in sample) {
        if( Math.abs( sample[i] - mean_val ) < (1 * sd_val) ) { one_sd++; }
        if( Math.abs( sample[i] - mean_val ) < (2 * sd_val) ) { two_sd++; }
        if( Math.abs( sample[i] - mean_val ) < (3 * sd_val) ) { three_sd++; }
    }

    return {
        mean    : mean(sample),
        sd      : sd(sample),
        one_sd  : one_sd / size,
        two_sd  : two_sd / size,
        three_sd: three_sd / size
    }
}

QUnit.module("Normal Distribution")
// Test if random standard normal distribution behaves as expected
QUnit.test( "Random Standard Normal Distribution", function( assert ) {

    var stdnorm = Wonky.normal(0, 1);
    var sample = sampleDistribution( stdnorm, 0, 1);
    assert.closeEnough(sample.one_sd, 0.68, 0.02, "First SD ~ 0.68");
    assert.closeEnough(sample.two_sd, 0.95, 0.02, "Second SD ~ 0.95");
    assert.closeEnough(sample.three_sd, 0.997, 0.02, "Third SD ~ 0.997");

    assert.closeEnough(sample.mean, 0.0, 0.06, "Mean ~ 0");
    assert.closeEnough(sample.sd, 1, 0.06, "Overall SD ~ 1");
});

// Test if random general normal distribution behaves as expected
QUnit.test('Random Parametrised Normal Distribution', function( assert ) {

    var mean = 10.0;
    var sd = 2.5;
    var parametricNormal = Wonky.normal(mean, Math.pow(sd,2));
    var sample = sampleDistribution( parametricNormal, 10, 2.5);

    assert.closeEnough(sample.one_sd, 0.68, 0.02, "First SD ~ 0.68");
    assert.closeEnough(sample.two_sd, 0.95, 0.02, "Second SD ~ 0.95");
    assert.closeEnough(sample.three_sd, 0.997, 0.02, "Third SD ~ 0.997");

    assert.closeEnough(sample.mean, mean, 0.06, "Mean ~ " + mean);
    assert.closeEnough(sample.sd, sd, 0.06, "Overall SD ~ " + sd);
});
