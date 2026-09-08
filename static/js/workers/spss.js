/**
 * Multithreaded SPSS-Style Statistical Analysis Worker
 * Offloads heavy statistical computations (descriptive metrics, frequencies, crosstabs, correlations, regression)
 * to background thread to maintain 60 FPS UI responsiveness.
 */

function computeDescriptives(values) {
  const nums = values.filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
  const n = nums.length;
  if (n === 0) return null;

  const sum = nums.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);
  const stdErr = stdDev / Math.sqrt(n);

  const min = nums[0];
  const max = nums[n - 1];
  const range = max - min;

  // Quartiles
  const q1 = nums[Math.floor(n * 0.25)];
  const median = n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[Math.floor(n / 2)];
  const q3 = nums[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  // Skewness & Kurtosis
  let m3 = 0;
  let m4 = 0;
  for (let i = 0; i < n; i++) {
    const diff = nums[i] - mean;
    m3 += Math.pow(diff, 3);
    m4 += Math.pow(diff, 4);
  }
  const skewness = (m3 / n) / Math.pow(stdDev || 1, 3);
  const kurtosis = ((m4 / n) / Math.pow(variance || 1, 2)) - 3;

  return {
    n,
    mean: Number(mean.toFixed(4)),
    stdErr: Number(stdErr.toFixed(4)),
    median: Number(median.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    skewness: Number(skewness.toFixed(4)),
    kurtosis: Number(kurtosis.toFixed(4)),
    range: Number(range.toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    sum: Number(sum.toFixed(4)),
    q1: Number(q1.toFixed(4)),
    q3: Number(q3.toFixed(4)),
    iqr: Number(iqr.toFixed(4))
  };
}

function computeFrequencies(values) {
  const counts = {};
  let total = 0;

  values.forEach(v => {
    const key = v === null || v === undefined || v === '' ? '(Missing)' : String(v);
    counts[key] = (counts[key] || 0) + 1;
    total++;
  });

  let cumCount = 0;
  const rows = Object.keys(counts).map(key => {
    const count = counts[key];
    cumCount += count;
    const percent = (count / total) * 100;
    const cumPercent = (cumCount / total) * 100;

    return {
      value: key,
      frequency: count,
      percent: Number(percent.toFixed(2)),
      cumPercent: Number(cumPercent.toFixed(2))
    };
  });

  return { total, rows };
}

function computeCorrelation(xVals, yVals) {
  const pairs = [];
  for (let i = 0; i < Math.min(xVals.length, yVals.length); i++) {
    const x = Number(xVals[i]);
    const y = Number(yVals[i]);
    if (!isNaN(x) && !isNaN(y)) {
      pairs.push([x, y]);
    }
  }

  const n = pairs.length;
  if (n < 2) return null;

  const sumX = pairs.reduce((acc, p) => acc + p[0], 0);
  const sumY = pairs.reduce((acc, p) => acc + p[1], 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  pairs.forEach(p => {
    const dx = p[0] - meanX;
    const dy = p[1] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  });

  const r = denX && denY ? num / Math.sqrt(denX * denY) : 0;
  const r2 = r * r;
  const slope = denX ? num / denX : 0;
  const intercept = meanY - slope * meanX;

  return {
    n,
    r: Number(r.toFixed(4)),
    r2: Number(r2.toFixed(4)),
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4))
  };
}

self.onmessage = function(e) {
  const msg = e.data;
  if (!msg) return;

  const startTime = performance.now();

  if (msg.type === 'RUN_DESCRIPTIVES') {
    const results = {};
    Object.keys(msg.columns).forEach(colName => {
      results[colName] = computeDescriptives(msg.columns[colName]);
    });
    const elapsed = Math.round(performance.now() - startTime);
    self.postMessage({ type: 'DESCRIPTIVES_RESULT', results, elapsed });
  } else if (msg.type === 'RUN_FREQUENCIES') {
    const results = computeFrequencies(msg.values);
    const elapsed = Math.round(performance.now() - startTime);
    self.postMessage({ type: 'FREQUENCIES_RESULT', results, elapsed });
  } else if (msg.type === 'RUN_CORRELATION') {
    const results = computeCorrelation(msg.xVals, msg.yVals);
    const elapsed = Math.round(performance.now() - startTime);
    self.postMessage({ type: 'CORRELATION_RESULT', results, elapsed });
  }
};
