import typescript from 'rollup-plugin-typescript';

export default {
  input: './lib/main.ts',
  output: {
    file: './dist/application.gs',
    format: 'cjs'
  },
  plugins: [
    typescript({
      target: 'ES3',
      lib: ['DOM'],
      removeComments: true
    })
  ]
};
