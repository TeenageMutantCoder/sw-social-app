/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  // https://github.com/vercel/next.js/issues/8733#issuecomment-944237964
  config.webpack = (config) => {
    return {
      ...config,
      watch: true,
      watchOptions: {
        aggregateTimeout: 1000,
        poll: 1000,
        ignored: ['node_modules', '.next'],
      },
    };
  };
  return config;
}

export default defineNextConfig({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['socialappmedia.stevon.dev'],
  },
});
