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
    context: 'window', // Add this line to silence the warning
    plugins: [
        nodeResolve(),
        // terser({
        //     compress: {
        //         warnings: false,
        //     },
        // }),
    ]
};