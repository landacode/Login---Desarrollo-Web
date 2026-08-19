import { passwordStrength, strengthLabels, strengthColors } from "../utils/validation";
import "./PasswordStrength.css";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const level = passwordStrength(password);
  if (!password) return null;

  return (
    <div className="strength" aria-label={`Seguridad: ${strengthLabels[level]}`}>
      <div className="strength__bars">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="strength__bar"
            style={{
              background: n <= level ? strengthColors[level] : "var(--border)",
            }}
          />
        ))}
      </div>
      <span
        className="strength__label"
        style={{ color: strengthColors[level] }}
      >
        {strengthLabels[level]}
      </span>
    </div>
  );
}
