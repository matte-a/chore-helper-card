import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: "lib/index.js",
    output: [
        {
            file: "dist/chore-helper-card.js",
            format: "cjs",
        },
    ],
    plugins: [nodeResolve()]
};