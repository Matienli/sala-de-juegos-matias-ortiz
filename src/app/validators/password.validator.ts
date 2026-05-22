import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const PASSWORD_REQUIREMENTS_MSG =
  'Mínimo 6 caracteres, una mayúscula, un número y un carácter especial.';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null || value === '') {
      return null;
    }
    if (typeof value !== 'string') {
      return { passwordStrength: true };
    }
    const ok =
      value.length >= 6 &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^A-Za-z0-9]/.test(value);
    return ok ? null : { passwordStrength: true };
  };
}

export const passwordValidators = [Validators.required, passwordStrengthValidator()];
