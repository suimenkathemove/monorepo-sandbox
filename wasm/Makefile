ifndef VERBOSE
.SILENT:
endif

.PHONY: wasm-build
wasm-build:
	wasm-pack build --release --target web --out-dir ../frontend/src/wasm/pkg
