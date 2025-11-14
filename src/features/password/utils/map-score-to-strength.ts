import type { StrengthLevel } from "../components/password-strength-meter";

interface MapScoreToStrengthOptions {
  min?: number;
  max?: number;
  password?: string;
}

type MapScoreToStrengthProps = (
  score: number,
  options: MapScoreToStrengthOptions,
) => StrengthLevel;

/**
 * Maps zxcvbn score (0-4) to password strength level (0-4)
 *
 * zxcvbn score mapping:
 * - 0: Too guessable (Weak)
 * - 1: Very guessable (Fair)
 * - 2: Somewhat guessable (Strong)
 * - 3: Safely unguessable (Very Strong)
 * - 4: Very unguessable (Very Strong)
 */
export const mapScoreToStrength: MapScoreToStrengthProps = (
  score,
  { min = 0, max = 4, password } = {},
) => {
  const passwordLength = password?.length ?? 0;
  let result: number;

  if (passwordLength === 0) {
    result = 0;
  } else if (score === 0 && passwordLength > 0) {
    result = 1;
  } else {
    result = Math.min(Math.max(score, min), max);
  }

  return result as StrengthLevel;
};
