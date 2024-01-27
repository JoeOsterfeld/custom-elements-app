# !/bin/bash

FORMAT_OPT="$1"
FORMATS=("esm" "umd" "cjs")
if [[ "$FORMAT_OPT" != "" ]]; then
    FORMATS=("$FORMAT_OPT")
fi

for FORMAT in "${FORMATS[@]}"; do
    npx rollup \
        --bundleConfigAsCjs \
        -i src/index.ts \
        -o "dist/minfw.$FORMAT.js" \
        -f "$FORMAT" \
        -n "Min" \
        -m \
        -p "@rollup/plugin-typescript" \
        -p "rollup-plugin-sourcemaps" \
        -p "@rollup/plugin-node-resolve" \
        -p "@rollup/plugin-commonjs" \
        -p "@rollup/plugin-terser"
done
