## [1.1.1](https://github.com/kelet-ai/feedback-ui/compare/v1.1.0...v1.1.1) (2026-02-11)


### Bug Fixes

* kelet url resolution ([4ea811f](https://github.com/kelet-ai/feedback-ui/commit/4ea811fd88fb94b203a09b871e29df330406de44))



# [1.1.0](https://github.com/kelet-ai/feedback-ui/compare/v1.0.2...v1.1.0) (2026-02-02)


### Bug Fixes

* bugs with event tracking ([77eb31a](https://github.com/kelet-ai/feedback-ui/commit/77eb31a762710258eb09180ed7318e357172d56a))


### Features

* add $domEvent to the metadata ([5a8e3f6](https://github.com/kelet-ai/feedback-ui/commit/5a8e3f67bca1882cd5ac4c6bc4c41f4590b920b6))



## [1.0.2](https://github.com/kelet-ai/feedback-ui/compare/v1.0.1...v1.0.2) (2025-09-08)


### Bug Fixes

* remove broken otel integration ([687b0db](https://github.com/kelet-ai/feedback-ui/commit/687b0dbca958bdca6976f3cdb23e2133d99ab447))
* remove broken otel integration ([43e448b](https://github.com/kelet-ai/feedback-ui/commit/43e448b39736908a2adf7623884e8cfafbfb1abb))



## [1.0.1](https://github.com/kelet-ai/feedback-ui/compare/v1.0.0...v1.0.1) (2025-09-08)


### Bug Fixes

* getTraceParent instead of getOtelTraceId ([f264086](https://github.com/kelet-ai/feedback-ui/commit/f264086e418b8686952930f5d4eadad5363cbe77))



# [1.0.0](https://github.com/kelet-ai/feedback-ui/compare/v0.7.1...v1.0.0) (2025-09-04)


### Features

* **feedback-state:** diff against initial eligible baseline; compact diff output; default debounce 3s ([a76d776](https://github.com/kelet-ai/feedback-ui/commit/a76d77658d75b2e95eae744df3be3076ebf7d72f))


### BREAKING CHANGES

* **feedback-state:** - Default debounce is now 3000ms (was 1500ms).
- Correction diffs are now computed from the initial eligible baseline instead of the previous state. Consumers relying on previous-state diffs should adjust expectations.



