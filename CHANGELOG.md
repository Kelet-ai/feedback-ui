## [1.0.1](https://github.com/kelet-ai/feedback-ui/compare/v1.0.0...v1.0.1) (2025-09-08)


### Bug Fixes

* getTraceParent instead of getOtelTraceId ([f264086](https://github.com/kelet-ai/feedback-ui/commit/f264086e418b8686952930f5d4eadad5363cbe77))



# [1.0.0](https://github.com/kelet-ai/feedback-ui/compare/v0.7.1...v1.0.0) (2025-09-04)


### Features

* **feedback-state:** diff against initial eligible baseline; compact diff output; default debounce 3s ([a76d776](https://github.com/kelet-ai/feedback-ui/commit/a76d77658d75b2e95eae744df3be3076ebf7d72f))


### BREAKING CHANGES

* **feedback-state:** - Default debounce is now 3000ms (was 1500ms).
- Correction diffs are now computed from the initial eligible baseline instead of the previous state. Consumers relying on previous-state diffs should adjust expectations.



## [0.7.1](https://github.com/kelet-ai/feedback-ui/compare/v0.7.0...v0.7.1) (2025-09-02)


### Bug Fixes

* kelet base url configurable ([1abd1e3](https://github.com/kelet-ai/feedback-ui/commit/1abd1e32b3eb8f3cb18c685719e6bcbfdafc162d))



# [0.7.0](https://github.com/kelet-ai/feedback-ui/compare/v0.6.0...v0.7.0) (2025-09-01)


### Bug Fixes

* remove explicit ESLint config type to resolve TypeScript conflicts ([d0638d2](https://github.com/kelet-ai/feedback-ui/commit/d0638d247202843b10b661484b3d4e0e5f3a1620))
* warn of potential improper use... ([fd864d0](https://github.com/kelet-ai/feedback-ui/commit/fd864d00bbdb61641439f54d5e936f27c5b6bc0c))


### Features

* add ignoreInitialNullish option to feedback state hooks ([9ad1e80](https://github.com/kelet-ai/feedback-ui/commit/9ad1e80c945a31b055033756ad837af9e79703f2))



# [0.6.0](https://github.com/kelet-ai/feedback-ui/compare/v0.5.1...v0.6.0) (2025-09-01)


### Features

* enable source content in source maps for better OSS debugging ([22cc5d8](https://github.com/kelet-ai/feedback-ui/commit/22cc5d85f92f005f1dcf714dcdd4c94c67b28c4a))



