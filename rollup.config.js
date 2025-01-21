import { nodeResolve } from '@rollup/plugin-node-resolve';
// import terser from '@rollup/plugin-terser';

export default {
    input: "lib/index.js",
    output: [
        {
            file: "dist/chore-helper-card.js",
            format: "cjs",
        },
    ],
    plugins: [
        nodeResolve(),
        // terser({
        //     compress: {
        //         warnings: false,
        //     },
        // }),
    ]
};