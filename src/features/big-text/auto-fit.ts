export interface FitOptions {
  containerW: number
  containerH: number
  minPx?: number
  maxPx?: number
  tolerance?: number
  maxIterations?: number
}

export interface Measurement {
  w: number
  h: number
}

export type MeasureFn = (fontSize: number) => Measurement

export function fitFontSize(measure: MeasureFn, opts: FitOptions): number {
  const min = opts.minPx ?? 16
  const max = opts.maxPx ?? 400
  const tolerance = opts.tolerance ?? 2
  const maxIter = opts.maxIterations ?? 20

  if (opts.containerW <= 0 || opts.containerH <= 0) return min

  let lo = min
  let hi = max

  const maxMeasure = measure(max)
  if (fits(maxMeasure, opts)) return max
  const minMeasure = measure(min)
  if (!fits(minMeasure, opts)) return min

  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2
    const m = measure(mid)
    if (fits(m, opts)) {
      if (hi - mid < tolerance) return mid
      lo = mid
    } else {
      if (mid - lo < tolerance) return lo
      hi = mid
    }
  }
  return lo
}

function fits(m: Measurement, opts: FitOptions): boolean {
  return m.w <= opts.containerW && m.h <= opts.containerH
}
