import typescript from 'rollup-plugin-typescript';

export default {
  input: './lib/main.js',
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
