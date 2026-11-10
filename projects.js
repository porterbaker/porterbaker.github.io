/*
 * Project data.
 *
 * Repos are fetched live from the GitHub API on page load. Anything listed in
 * CURATED gets a full write-up; anything with stars is promoted into the
 * featured list automatically. Everything else public shows up under
 * "More on GitHub". To hide a repo, add it to HIDDEN.
 */
window.SITE = {
  user: "porterbaker",

  HIDDEN: ["porterbaker", "jsquared", "personal-projects"],

  CURATED: {
    kujira: {
      title: "Kujira",
      tag: "College football analytics pipeline",
      lang: "Python",
      body:
        "A resumable, rate-limit-aware ingestion pipeline for the CollegeFootballData API: 11,800+ calls across 29 endpoints and 13 seasons with zero failed requests. The raw responses become 23 typed Parquet tables with data-quality reports and leakage checks, feeding a hierarchical Bayesian player-value model in NumPyro.",
      stats: ["1.9M plays", "4.9M player-games", "100+ tests"],
      stack: "Polars · DuckDB · NumPyro",
    },
    openeia: {
      title: "openeia",
      tag: "Python client for the EIA v2 API",
      lang: "Python",
      body:
        "Every U.S. Energy Information Administration dataset with automatic pagination, resumable chunked backfills, and tidy pandas or polars frames. Includes a worked case study: a walk-forward LightGBM day-ahead forecaster for TVA load at 2.11% MAPE, against 6.69% for a naive baseline.",
      stats: ["Published on PyPI", "232 datasets", "2.11% MAPE"],
      stack: "LightGBM · pandas · polars",
      link: { href: "https://pypi.org/project/openeia/", label: "PyPI" },
    },
    snn: {
      title: "snn",
      tag: "Spiking neural network in plain C",
      lang: "C",
      body:
        "A recurrent network of parametric leaky integrate-and-fire neurons trained online with e-prop on sequential MNIST, one pixel per time step. Each neuron learns its own membrane time constant and adaptive threshold. Gradients are carried forward in time, so no history is stored. Comes with a live browser dashboard for watching it train.",
      stats: ["784-step sequences", "Online learning"],
      stack: "C · pthreads · JS dashboard",
    },
    ACIR_py: {
      title: "ACIR",
      tag: "Active contour image recognition",
      lang: "Python",
      body:
        "Final project for my B.S. in Computer Science: an implementation and analysis of active contour techniques for image recognition, with parameter autotuning.",
      stack: "Python",
    },
    gmx_bot: {
      title: "gmx_bot",
      tag: "Delta-neutral yield on GMX v2",
      lang: "Python",
      body:
        "Bots built on the gmx-python-sdk to explore delta-neutral yield-farming strategies on the GMX perpetual exchange, with a paper-trading mode for testing strategies before going live.",
      stack: "Python · web3.py",
    },
    carry: {
      title: "Carry",
      tag: "Delta-neutral yield vaults",
      lang: "TypeScript",
      body:
        "A vault platform on Lagoon Finance for delta-neutral strategies across the five highest-volume Lighter perp markets. ERC-20 vault tokens, position tracking, APR/TVL stats, and a React frontend.",
      stack: "TypeScript · Viem · React",
    },
    python_dydx: {
      title: "python_dydx",
      tag: "BTC perpetuals quant research",
      lang: "Python",
      body:
        "Pulls 18 months of 5-minute candles and funding rates from the dYdX v4 indexer, builds funding-aware features, and runs walk-forward models with threshold sweeps and slippage sensitivity tests.",
      stack: "pandas · scikit-learn · XGBoost",
    },
  },


  // Snapshot used if the GitHub API is unreachable or rate-limited.
  FALLBACK: [
    { name: "kujira", stargazers_count: 0, pushed_at: "2026-10-19T11:58:48Z", language: "Python", description: "" },
    { name: "snn", stargazers_count: 0, pushed_at: "2026-10-07T03:28:36Z", language: "HTML", description: "" },
    { name: "openeia", stargazers_count: 1, pushed_at: "2026-08-13T19:32:48Z", language: "Python", description: "" },
    { name: "ACIR_py", stargazers_count: 1, pushed_at: "2026-04-07T20:03:20Z", language: "Python", description: "Image Recognition Final Project for my Bachelor's in CS, implementing Active Contour IR techniques and analysis" },
    { name: "python_dydx", stargazers_count: 0, pushed_at: "2026-03-09T02:18:12Z", language: "Python", description: "" },
    { name: "carry", stargazers_count: 0, pushed_at: "2025-11-12T14:15:25Z", language: "TypeScript", description: "" },
    { name: "gmx_bot", stargazers_count: 1, pushed_at: "2025-10-07T16:12:25Z", language: "Python", description: "Delta-neutral yield farming on GMX v2" },
    { name: "auctionwebsite", stargazers_count: 0, pushed_at: "2025-06-18T20:32:43Z", language: "Python", description: "Auction website from my software development class" },
  ],

  LANG_COLORS: {
    Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a", HTML: "#e34c26",
    C: "#555555", Rust: "#dea584", CSS: "#563d7c", Shell: "#89e051", Jupyter: "#DA5B0B",
  },
};
