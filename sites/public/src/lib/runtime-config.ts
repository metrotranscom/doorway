// Next.js adds config values to process.env, but not as real props
const runtimeVars = {}

// copy over only the "real" env vars
Object.keys(process.env).map((key) => {
  runtimeVars[key] = process.env[key]
})

// provide a read-only interface to vars
const varProxy = new Proxy(runtimeVars, {
  get(target, key: string) {
    return target[key as keyof typeof target]
  },
}) as Record<string, string>

export const runtimeConfig = {
  // provide a proxy to enable direct lookups
  // runtimeConfig.env.SOME_ENV_VAR
  env: varProxy,

  // a getter that enables getting a var by string value
  // const key = "SOME_ENV_VAR"
  // runtimeConfig.get(key)
  get(key: string): string {
    return this.env[key]
  },
}
