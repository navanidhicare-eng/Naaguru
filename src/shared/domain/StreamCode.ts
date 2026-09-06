export const STREAM_CODES = ['MPC', 'BIPC', 'MEC', 'CEC', 'HEC'] as const;

export type StreamCode = typeof STREAM_CODES[number];

export function isStreamCode(code: string): code is StreamCode {
  return STREAM_CODES.includes(code as StreamCode);
}
